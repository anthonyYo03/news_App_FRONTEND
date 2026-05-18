import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login/Login';
import Register from './RandomReader/Register/Register';
import News from './RandomReader/News/News';
import { Toaster } from 'react-hot-toast';
import NotFound from './NotFound/NotFound';
import GetOneNews from './RandomReader/News/GetOneNews';
import ReaderDashboard from './Reader/ReaderDashboard';
import JournalistDashboard from './Journalist/JournalistDashboard';
import AdminDashboard from './Admin/AdminDashboard';
import GetOneNewsReader from './Reader/GetOneNewsReader';
import GetOneNewsJournalist from './Journalist/JournalistActions/GetOneNewsJournalist';
import CreateNews from './Journalist/JournalistActions/CreateNews';
import EditNews from './Journalist/JournalistActions/EditNews';
import CreateUser from './Admin/AdminFunctionalities/CreateUser';
import AdminGetOneUser from './Admin/AdminFunctionalities/GetOneUser';
import EditUser from './Admin/AdminFunctionalities/EditUser';
import ResetPassword from './ResetPassword/ResetPassword';
import ForgetPassword from './ForgetPassword/ForgetPassword';
function App() {
  return (
   <>
   <BrowserRouter>
      <Toaster position='top-right' />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<News />} />
        <Route path="/oneNews/:id" element={<GetOneNews />} />
        <Route path="/readerDashboard" element={<ReaderDashboard />} />
        <Route path="/journalistDashboard" element={<JournalistDashboard />}> 
        
        </Route>
        <Route path='/createNews' element={<CreateNews />} />
        <Route path='/editNews/:id' element={<EditNews />} />
        



        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/createUser" element={<CreateUser />} />
        <Route path="/adminGetOneUsers/:id" element={<AdminGetOneUser />} />
        <Route path='/readerNews/:id' element={<GetOneNewsReader />} />
        <Route path='/journalistNews/:id' element={<GetOneNewsJournalist />} />
        <Route path="/adminEditUser/:id" element={<EditUser />} /> 
        <Route path="*" element={<NotFound />} /> 

      </Routes>
    </BrowserRouter>
   </>
  );
}

export default App;
