import React, { useState, useEffect } from 'react';

export const CustomForm = ({ status, message, onValidated }) => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    email &&
      email.indexOf('@') > -1 &&
      onValidated({
        EMAIL: email,
      });
  };

  useEffect(() => {
    if (status === 'success') clearFields();
  }, [status]);

  const clearFields = () => {
    setEmail('');
  };
  const validateEmail = (e) => {
    setEmail(e.target.value);
    const localEmail = e.target.value;
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (pattern.test(localEmail)) {
      setEmailError(false);
    } else {
      setEmailError(true);
    }
  };
  return (
    <form
      className="mc__form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
    >
      <h5 className="mc__title">
        {status === 'success'
          ? 'Success!'
          : 'Subscribe for exclusive RoamAround deals on this itinerary:'}
      </h5>
      <div style={styles.formContainer} className="form-container">
        {status === 'sending' && <div className="sending">sending...</div>}
        {status === 'error' && (
          <div
            className="error-message"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
        {status === 'success' && (
          <div
            className="success-message"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
        {status !== 'success' ? (
          <div className="mc__field-container">
            <input
              onChange={(e) => validateEmail(e)}
              type="email"
              value={email}
              placeholder="your@email.com"
            />

            <button
              className="input-button submitBtn"
              type="submit"
              disabled={emailError}
            >
              Submit
            </button>
          </div>
        ) : null}
        {email && emailError && (
          <p style={styles.error}>Please Enter valid Email</p>
        )}
      </div>
    </form>
  );
};
const styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    margin: '20px auto 0px',
    padding: '5px',
    boxShadow: '0px 0px 12px rgba(198, 131, 255, .2)',
    borderRadius: '10px',
  },
  error: {
    color: 'red',
    fontSize: '11px',
    margin: '5px 0',
  },
};
