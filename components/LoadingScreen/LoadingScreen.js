import Image from "next/image";
import styles from "./LoadingScreen.module.css";

function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
        <img src="/loading.gif" alt="loading-gif"/>
        <h2 className={styles.loadingText}>Loading...</h2>
    </div>
  )
}

export default LoadingScreen