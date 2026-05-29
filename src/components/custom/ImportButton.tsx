import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  useNotify,
  useDataProvider,
  useRefresh,
  useGetIdentity,
  useGetList,
} from "react-admin";
import Papa from "papaparse";

// Define the type for CSV row data
interface CsvQuestionRow {
  question_text?: string;
  question_type?: string;
  options?: string | string[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: string;
  is_active?: string | boolean;
  [key: string]: unknown; // For any additional columns
}
// Custom session selector component that works outside Form context
const SessionSelector = ({
  onChange,
  value,
}: {
  onChange: (id: string) => void;
  value: string | null;
}) => {
  const { data, isLoading } = useGetList("exam_session");
  const sessions = data || [];

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "8px", marginTop: "4px" }}
      disabled={isLoading}
    >
      <option value="">Select an exam session...</option>
      {sessions.map((session: any) => (
        <option key={session.id} value={session.id}>
          {session.session_name}
        </option>
      ))}
    </select>
  );
};

export const CustomImportButton = ({ resource }: { resource: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const notify = useNotify();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();

  const handleClose = () => {
    setOpen(false);
    setSelectedSessionId(null);
    setSelectedFile(null);
    setParseErrors([]);
    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParseErrors([]);
    }
  };
  const handleImport = async () => {
    if (!selectedFile) {
      notify("Please select a file first", { type: "warning" });
      return;
    }

    if (!selectedSessionId) {
      notify("Please select an exam session", { type: "warning" });
      return;
    }

    setLoading(true);
    setParseErrors([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
      complete: async (results) => {
        if (results.errors && results.errors.length > 0) {
          const errors = results.errors.map(
            (err: any) => `Row ${err.row}: ${err.message}`,
          );
          setParseErrors(errors.slice(0, 5));
          setLoading(false);
          return;
        }

        const rawData = results.data as any[];
        const validRows = rawData.filter((row) => {
          if (!row || typeof row !== "object") return false;
          if (!row.question_text || row.question_text.trim() === "")
            return false;
          return true;
        });

        if (validRows.length === 0) {
          notify("No valid questions found.", { type: "error" });
          setLoading(false);
          return;
        }

        const skippedCount = results.data.length - validRows.length;
        if (skippedCount > 0) {
          notify(`${skippedCount} empty or invalid rows were skipped.`, {
            type: "warning",
          });
        }

        try {
          let successCount = 0;
          let errorCount = 0;

          for (const row of validRows) {
            try {
              // Parse topics if provided
              let topics = null;
              if (row.topics) {
                if (typeof row.topics === "string") {
                  try {
                    topics = JSON.parse(row.topics);
                  } catch {
                    // If JSON parse fails, treat as comma-separated
                    topics = row.topics.split(",").map((t: string) => t.trim());
                  }
                } else if (Array.isArray(row.topics)) {
                  topics = row.topics;
                }
              }

              // Parse options if provided
              let options = null;
              if (row.options) {
                if (typeof row.options === "string") {
                  options = row.options
                    .split(",")
                    .map((opt: string) => opt.trim());
                } else if (Array.isArray(row.options)) {
                  options = row.options;
                }
              }

              await dataProvider.create(resource, {
                data: {
                  question_text: row.question_text,
                  question_type: row.question_type || "mcq",
                  options: options,
                  correct_answer: row.correct_answer || "",
                  explanation: row.explanation || "",
                  difficulty: row.difficulty || "medium",
                  is_active: true,
                  topics: topics,
                  created_by: identity?.id,
                  exam_session_id: selectedSessionId,
                  subject_id: row.subject_id || null,
                },
              });
              successCount++;
            } catch (err) {
              console.error("Row error:", err, row);
              errorCount++;
            }
          }

          if (successCount > 0) {
            notify(
              `Imported ${successCount} questions successfully${errorCount > 0 ? `. ${errorCount} failed.` : ""}`,
              {
                type: errorCount > 0 ? "warning" : "success",
              },
            );
            refresh();
            handleClose();
          } else {
            notify("Import failed. No questions were imported.", {
              type: "error",
            });
          }
        } catch (error: any) {
          console.error("Import error:", error);
          notify(error?.message || "Import failed.", { type: "error" });
        } finally {
          setLoading(false);
        }
      },
      error: (error: any) => {
        console.error("Parse error:", error);
        notify("Failed to parse CSV file.", { type: "error" });
        setLoading(false);
      },
    });
  };
  const downloadTemplate = () => {
    const template = `question_text,question_type,options,correct_answer,explanation,difficulty,subject_id,topics
"What is the normal resting heart rate for a healthy adult?",mcq,"60-100 bpm,40-60 bpm,100-120 bpm,120-140 bpm",60-100 bpm,"The normal resting heart rate for adults ranges from 60 to 100 beats per minute. Athletes may have lower rates around 40-60 bpm.",easy,1,"[""Cardiovascular"",""Vital Signs""]"
"True or False: The left ventricle pumps blood to the lungs.",true_false,"True,False",False,"The right ventricle pumps blood to the lungs. The left ventricle pumps oxygenated blood to the rest of the body.",medium,1,"[""Cardiovascular"",""Heart Anatomy""]"
"The functional unit of the kidney is the ______.",short_answer,"",Nephron,"The nephron is the microscopic structural and functional unit of the kidney responsible for filtering blood and forming urine.",hard,1,"[""Renal System"",""Nephron""]"`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="contained" color="primary">
        Import CSV
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Import Questions from CSV</DialogTitle>

        <DialogContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Download Template Button */}
          <Button onClick={downloadTemplate} size="small" sx={{ mb: 1 }}>
            Download CSV Template
          </Button>
          <Button size="small" sx={{ display: "block", mb: 2 }}>
            <a
              href="https://www.loom.com/share/56f37f499650420b8495b319173db7d2"
              target="_blank"
              rel="noopener noreferrer"
            >
              How to import questions in bulk
            </a>
          </Button>
          {/* Exam Session Selection - Using custom selector instead of ReferenceInput */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Select Exam Session *
            </label>
            <SessionSelector
              onChange={setSelectedSessionId}
              value={selectedSessionId}
            />
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Upload CSV File *
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ width: "100%" }}
            />
            <small
              style={{ color: "#666", display: "block", marginTop: "8px" }}
            >
              Required columns: question_text, question_type, subject_id
              correct_answer,options, explanation,
              <br />
              Optional: difficulty, is_active, topics
            </small>
          </div>

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>CSV Format Issues:</strong>
              <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* File Preview */}
          {selectedFile && !loading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Ready to import: <strong>{selectedFile.name}</strong>
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || !selectedSessionId || loading}
            variant="contained"
            color="primary"
          >
            Import Questions
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
