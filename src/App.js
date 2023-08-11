import React , {useEffect } from 'react';
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import Page from "../src/components/neha/Page";
import Login from './components/Login';
import Register from './components/Register';
import Result_M from './components/mayank/Result_M';

import Instructions from './components/Instructions';
import Quiz from './components/Quiz';

import Analytics from "./components/Admin/Analytics";
import AdminQuestions from "./components/Admin/AdminQuestions";
import AdminUsers from "./components/Admin/AdminUsers";


//IMPORTS FOR Language change Functionality
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import './library/i18n';


function App() {


//? Language Functionality Starts ............................................................
  
const { t } = useTranslation("translation", { keyPrefix: 'home' } );
  
//used to get language Stored in LocalStorage //*should be in every Page having Language Functionality 
useEffect(()=>{
  let currentLang = localStorage.getItem('lang');
  i18n.changeLanguage(currentLang);

  // console.log(t('array'  , { returnObjects: true }));

},[]);


//? Language Functionality Ends .................................................................



  return (
    <Router>
      <div>
        <Navbar />
        <Toaster toastOptions={{ duration: 4000 }} />
        <Routes>
        {/* User */}
          <Route path="/" element={<Page />} />
          <Route path="/login" element={<Login />} />
          <Route path="/test/instructions" element={<Instructions/>} />
          <Route path="/test/start" element={<Quiz/>} />
          <Route path="/test/register" element={<Register/>} />
          <Route path="/test/result" element={<Result_M/>} />

          {/* Admin */}
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/questions" element={<AdminQuestions />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
