import styles from './ErrorMessage.module.css';

function ErrorMessage({ message, onRetry, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>⚠️ Error</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            {onRetry && (
              <button onClick={onRetry} className={styles.retryButton}>
                Try Again
              </button>
            )}
            <button onClick={onClose} className={styles.okButton}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
