import { onGoBack } from '../../common/globals';
import withGoBack from '../../redux/HOC/withGoBack';
import Header from '../Header';
import formSpecJSON from "./cancelWorkflow.json";
import React, { useState, useEffect } from 'react';
import { deleteDstMc, getIndustriesList, getITIsList, getLoggedInITIDetails } from "../../utils/utils";
import withNotify from "../../redux/HOC/withNotify";
import withLoader from "../../redux/HOC/withLoader";
import withUser from "../../redux/HOC/withUser";

const CancelDstMc = ({ goBack, setLoader, user, setNotify }) => {
  const [userDetails, setUserDetails] = useState({});
  const [currentIti, setCurrentIti] = useState('');
  const [industries, setIndustries] = useState([]);

  const onBack = () => {
    onGoBack(goBack);
  };

  const formSpec = formSpecJSON;
  const [isFirst, setIsFirst] = useState(true);
  // Encode string method to URI
  const encodeFunction = (func) => encodeURIComponent(JSON.stringify(func));


  const getFormURI = (form, ofsd, prefillSpec) => {
    console.log(form, ofsd, prefillSpec);
    return encodeURIComponent(`http://localhost:3002/prefill?form=${form}&onFormSuccessData=${encodeFunction(ofsd)}&prefillSpec=${encodeFunction(prefillSpec)}`);
  };

  const startingForm = formSpec.start;
  const [formId, setFormId] = useState(startingForm);
  const [encodedFormSpec, setEncodedFormSpec] = useState(encodeURI(JSON.stringify(formSpec.forms[formId])));
  const [onFormSuccessData, setOnFormSuccessData] = useState(undefined);
  const [onFormFailureData, setOnFormFailureData] = useState(undefined);
  const [encodedFormURI, setEncodedFormURI] = useState(getFormURI(formId, formSpec.forms[formId].onSuccess, formSpec.forms[formId].prefill));


  function afterFormSubmit(e) {
    const data = JSON.parse(e.data);
    try {
      /* message = {
        nextForm: "formID",
        formData: {},
      }
      */
      const { nextForm, formData, onSuccessData, onFailureData } = data;
      if (data.state == 'ON_FORM_SUCCESS_COMPLETED') {
        console.log('formData', formData);
        /*const reqData = {
          id: formData.id
        };

        deleteDstMc(reqData).then((res) => {
          setNotify({ message: 'Form Created Successfully', type: 'success' });
        });*/
      }
      if (nextForm.type === 'form') {
        setFormId(nextForm.id);
        setOnFormSuccessData(onSuccessData);
        setOnFormFailureData(onFailureData);
        setEncodedFormSpec(encodeURI(JSON.stringify(formSpec.forms[formId])));
        setEncodedFormURI(getFormURI(nextForm.id, onSuccessData, formSpec.forms[nextForm.id].prefill));
      } else {
        window.location.href = nextForm.url;
      }
    }
    catch (e) {
      // console.log(e)
    }
  }

  const fetchUserDetails = async () => {
    setLoader(true);
    const reqData = {
      itiName: user?.user?.user?.username || ''
    };
    const { data: { principal } } = await getLoggedInITIDetails(reqData);
    setUserDetails(principal[0]);
    formSpec.forms[formId].prefill.district2 = "`" + `${principal[0]?.district}` + "`";
    formSpec.forms[formId].prefill.ITI2 = "`" + `${principal[0]?.iti}` + "`";
    setEncodedFormSpec(encodeURI(JSON.stringify(formSpec.forms[formId])));
    setEncodedFormURI(getFormURI(formId, formSpec.forms[formId].onSuccess, formSpec.forms[formId].prefill));
    setLoader(false);
  };

  const fetchITIsList = async () => {
    const data = await getITIsList();
    const currentITI = data.data.iti.find((item) => item.name == user?.user?.user?.username).id;
    setCurrentIti(currentITI);
    fetchIndustriesList();
  };

  const fetchIndustriesList = async () => {
    const data = await getIndustriesList();
    setIndustries(data.data.industry);
  };

  const bindEventListener = () => {
    window.addEventListener('message', (e) => { afterFormSubmit(e); });
  };

  useEffect(() => {
    bindEventListener();
  }, [industries]);

  useEffect(() => {
    fetchITIsList();
    fetchUserDetails();
  }, []);


  return (
    <div>
      <Header title="Create DST MC" onBackButton={onBack} />
      <div className="text-center text-teal-700">
        <iframe title='current-form'
          style={{ height: "100vh", width: "100vw" }}
          src={
            `http://localhost:8065/preview?formSpec=${encodedFormSpec}&xform=${encodedFormURI}`
          }
        />
      </div>
    </div>
  );
};

export default withNotify(withLoader(withUser(withGoBack(CancelDstMc))));
