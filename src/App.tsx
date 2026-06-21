import { createClient } from "@supabase/supabase-js";
import { BrowserRouter } from "react-router";
import ProfileList from "./pages/profiles/profile-list";
import { Admin, Layout, LoginPage } from "./components/admin";
import { BookOpen, ClipboardList, Users, Wallpaper } from "lucide-react";
import { Resource } from "ra-core";
import { ProfileEdit } from "./pages/profiles/profile-edit";
import { QuestionList } from "./pages/questions/question-list";
import { Database } from "./lib/types/supabase";
import { QuestionCreate } from "./pages/questions/Create";
import { ExamSessionList } from "./pages/exam-session/ListSession";
import { ExamSessionCreate } from "./pages/exam-session/CreateSession";
import { createAuthProvider } from "./providers/authProvider";
import { createDataProvider } from "./providers/dataProvider";
import ExamList from "./pages/exams/ExamList";
import { QuestionShow } from "./pages/questions/ShowList";
import QuestionEdit from "./pages/questions/EditQuestion";
import ExamSessionEdit from "./pages/exam-session/EditSession";
import SubjectList from "./pages/subjects/SubjectList";
import ShowSubject from "./pages/subjects/ShowSubject";
import EditSubject from "./pages/subjects/EditSubject";
import ShowProfiles from "./pages/profiles/ShowProfiles";
import EditExam from "./pages/exams/EditExam";
import ListBundles from "./pages/bundles/ListBundles";
import ListBundleQuestion from "./pages/bundle_question/ListBundleQuestion";
import Dashboard from "./pages/dashboard/Dashboard";
import { ResourceList } from "./pages/resources/ResourceList";
import { ResourceCreate } from "./pages/resources/ResourceCreate";
import { ResourceEdit } from "./pages/resources/ResourceEdit";

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseClient = createClient<Database>(instanceUrl, apiKey);

// Create auth provider first
const authProvider = createAuthProvider(supabaseClient, instanceUrl, apiKey);

// Create data provider with access to user state
const dataProvider = createDataProvider(
  supabaseClient,
  instanceUrl,
  apiKey,
  () =>
    authProvider.getIdentity() as Promise<{
      id: string;
      roles: string[];
    } | null>,
);

export const App = () => (
  <BrowserRouter>
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      layout={Layout}
      loginPage={LoginPage}
      dashboard={Dashboard}
    >
      <Resource
        name="profiles"
        list={<ProfileList />}
        icon={Users}
        show={<ShowProfiles />}
        edit={<ProfileEdit />}
      />
      <Resource
        name="exam_session"
        list={<ExamSessionList />}
        edit={<ExamSessionEdit />}
        create={<ExamSessionCreate />}
        icon={Wallpaper}
      />
      <Resource name="bundles" list={<ListBundles />} />
      <Resource name="bundle_questions" list={<ListBundleQuestion />} />
      <Resource name="exams" list={<ExamList />} edit={<EditExam />} />
      <Resource
        name="questions"
        list={<QuestionList />}
        edit={<QuestionEdit />}
        show={<QuestionShow />}
        create={<QuestionCreate />}
        hasEdit={true}
      />
      <Resource
        name="subjects"
        list={<SubjectList />}
        icon={ClipboardList}
        hasEdit={true}
        hasShow={true}
        edit={<EditSubject />}
        show={<ShowSubject />}
      />
      <Resource
        name="resources"
        list={<ResourceList />}
        create={<ResourceCreate />}
        edit={<ResourceEdit />}
        icon={BookOpen}
        options={{ label: "Resource Centre" }}
      />
      {/* <Resource name="purchases" list={ListGuesser} /> */}
    </Admin>
  </BrowserRouter>
);
