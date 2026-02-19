import { useState, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as validators from "../validators";
import "react-toastify/dist/ReactToastify.css";
import "./UserForm.css";

const INITIAL_FORM_DATA = {
  firstName: "",
  lastName: "",
  email: "",
  birthDate: "",
  postalCode: "",
  city: "",
};

const INITIAL_ERRORS = {
  firstName: "",
  lastName: "",
  email: "",
  birthDate: "",
  postalCode: "",
  city: "",
};

const INITIAL_TOUCHED = {
  firstName: false,
  lastName: false,
  email: false,
  birthDate: false,
  postalCode: false,
  city: false,
};

const TOAST_CONFIG = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * UserForm Component - Registration form with real-time validation
 *
 * @component
 * @description Form component that collects user information (first name, last name, email,
 * birth date, postal code, city) with immediate validation feedback and localStorage persistence.
 *
 * @param {Object} props - Component props
 * @param {Function} [props.onUserRegistered] - Optional callback function called after successful registration with user data
 * @returns {JSX.Element} The rendered form component
 */
const UserForm = ({ onUserRegistered }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState(INITIAL_TOUCHED);

  /**
   * Validates a single field using the appropriate validator function
   *
   * @param {string} fieldName - Name of the field to validate
   * @param {string} value - Value to validate
   * @param {Array<Object>|null} existingUsers - Array of existing users for email uniqueness check, or null to read from localStorage
   * @returns {string} Error message if validation fails, empty string otherwise
   */
  const validateField = (fieldName, value, existingUsers) => {
    try {
      switch (fieldName) {
        case "firstName":
          validators.validateIdentity(value);
          return "";

        case "lastName":
          validators.validateIdentity(value);
          return "";

        case "email":
          validators.validateEmailComplete(value, existingUsers);
          return "";

        case "birthDate":
          if (!value) {
            return "Birth date is required";
          }
          const date = new Date(value);
          validators.validateAge(date);
          return "";

        case "postalCode":
          validators.validatePostalCode(value);
          return "";

        case "city":
          validators.validateIdentity(value);
          return "";

        /* istanbul ignore next */
        default:
          return "";
      }
    } catch (error) {
      return error.message;
    }
  };

  /**
   * Detects browser autofill and triggers validation
   * Chrome and other browsers fill forms without triggering React onChange events
   * This effect polls the DOM to detect autofilled values and validates them
   */
  useEffect(() => {
    const fields = ["firstName", "lastName", "email", "birthDate", "postalCode", "city"];

    const checkAutofill = () => {
      fields.forEach((fieldName) => {
        const input = document.getElementById(fieldName);
        if (input && input.value && input.value !== formData[fieldName]) {
          setFormData((prev) => ({ ...prev, [fieldName]: input.value }));

          setTouched((prev) => ({ ...prev, [fieldName]: true }));

          const errorMessage = validateField(fieldName, input.value, null);
          setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
        }
      });
    };

    const timer1 = setTimeout(checkAutofill, 100);
    const timer2 = setTimeout(checkAutofill, 500);

    const handleAutoComplete = () => {
      setTimeout(checkAutofill, 50);
    };

    const inputRefs = [];

    fields.forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      if (input) {
        input.addEventListener("input", handleAutoComplete);
        inputRefs.push(input);
      }
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      inputRefs.forEach((input) => {
        input.removeEventListener("input", handleAutoComplete);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles input change events with real-time validation
   *
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errorMessage = validateField(name, value, null);
      setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    }
  };

  /**
   * Handles blur event (focus out) to trigger validation
   *
   * @param {Event} e - Blur event
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const errorMessage = validateField(name, value, null);
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  /**
   * Checks if the entire form is valid
   * Validates all fields are filled and checks for any validation errors
   *
   * @param {Array<Object>} existingUsers - Array of existing users for email uniqueness check (pass empty array if none)
   * @returns {boolean} True if form is valid, false otherwise
   */
  const isFormValid = (existingUsers) => {
    const allFieldsFilled = Object.values(formData).every((value) => value.trim() !== "");
    if (!allFieldsFilled) return false;

    const fieldValidations = [
      { name: "firstName", value: formData.firstName },
      { name: "lastName", value: formData.lastName },
      { name: "email", value: formData.email },
      { name: "birthDate", value: formData.birthDate },
      { name: "postalCode", value: formData.postalCode },
      { name: "city", value: formData.city },
    ];

    for (const field of fieldValidations) {
      const error = validateField(field.name, field.value, existingUsers);
      if (error) return false;
    }

    return true;
  };

  /**
   * Handles form submission
   * Saves data to localStorage, displays success message, and resets form
   *
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    let existingUsers = [];
    try {
      const storedUsers = localStorage.getItem("registeredUsers");
      existingUsers = storedUsers ? JSON.parse(storedUsers) : [];
    } catch {
      existingUsers = [];
    }

    if (isFormValid(existingUsers)) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        age: age,
        postalCode: formData.postalCode,
        city: formData.city,
        timestamp: new Date().toISOString(),
      };

      existingUsers.push(userData);
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

      if (onUserRegistered) {
        onUserRegistered(userData);
      } else {
        toast.success("Formulaire soumis avec succès !", TOAST_CONFIG);
      }

      setFormData(INITIAL_FORM_DATA);
      setErrors(INITIAL_ERRORS);
      setTouched(INITIAL_TOUCHED);
    }
  };

  /**
   * Memoized button disabled state
   * Recalculates only when formData changes to avoid unnecessary localStorage reads
   */
  const isButtonDisabled = useMemo(() => {
    const allFieldsFilled = Object.values(formData).every((value) => value.trim() !== "");
    if (!allFieldsFilled) return true;

    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) return true;

    return false;
  }, [formData, errors]);

  return (
    <div className="user-form-container">
      <ToastContainer />
      <form className="user-form" onSubmit={handleSubmit} noValidate aria-label="User registration form">
        <h1 data-cy="form-title">Registration Form</h1>

        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.firstName && touched.firstName ? "error" : ""}
            aria-invalid={errors.firstName && touched.firstName ? "true" : "false"}
            aria-describedby={errors.firstName && touched.firstName ? "firstName-error" : undefined}
            data-cy="input-firstName"
          />
          {errors.firstName && touched.firstName && (
            <span id="firstName-error" className="error-message" role="alert" data-cy="error-firstName">
              {errors.firstName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.lastName && touched.lastName ? "error" : ""}
            aria-invalid={errors.lastName && touched.lastName ? "true" : "false"}
            aria-describedby={errors.lastName && touched.lastName ? "lastName-error" : undefined}
            data-cy="input-lastName"
          />
          {errors.lastName && touched.lastName && (
            <span id="lastName-error" className="error-message" role="alert" data-cy="error-lastName">
              {errors.lastName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email && touched.email ? "error" : ""}
            aria-invalid={errors.email && touched.email ? "true" : "false"}
            aria-describedby={errors.email && touched.email ? "email-error" : undefined}
            data-cy="input-email"
          />
          {errors.email && touched.email && (
            <span id="email-error" className="error-message" role="alert" data-cy="error-email">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Birth date *</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.birthDate && touched.birthDate ? "error" : ""}
            aria-invalid={errors.birthDate && touched.birthDate ? "true" : "false"}
            aria-describedby={errors.birthDate && touched.birthDate ? "birthDate-error" : undefined}
            data-cy="input-birthDate"
          />
          {errors.birthDate && touched.birthDate && (
            <span id="birthDate-error" className="error-message" role="alert" data-cy="error-birthDate">
              {errors.birthDate}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="postalCode">Postal Code *</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.postalCode && touched.postalCode ? "error" : ""}
            aria-invalid={errors.postalCode && touched.postalCode ? "true" : "false"}
            aria-describedby={errors.postalCode && touched.postalCode ? "postalCode-error" : undefined}
            maxLength="5"
            data-cy="input-postalCode"
          />
          {errors.postalCode && touched.postalCode && (
            <span id="postalCode-error" className="error-message" role="alert" data-cy="error-postalCode">
              {errors.postalCode}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.city && touched.city ? "error" : ""}
            aria-invalid={errors.city && touched.city ? "true" : "false"}
            aria-describedby={errors.city && touched.city ? "city-error" : undefined}
            data-cy="input-city"
          />
          {errors.city && touched.city && (
            <span id="city-error" className="error-message" role="alert" data-cy="error-city">
              {errors.city}
            </span>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={isButtonDisabled} aria-label="Submit the form" data-cy="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default UserForm;
