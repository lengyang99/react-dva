import React from 'react';
import styles from './DialogForm.less';

const ErrorMessage = ({ flag, message }) => (
  <p className={styles.form__error__message} style={{ display: flag ? 'block' : 'none' }}>{message}</p>
);

export default ErrorMessage;
