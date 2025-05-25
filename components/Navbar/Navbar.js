import styles from "./Navbar.module.css"

function Navbar({ onSettingsClick }) {
  return (
    <nav className={styles.navbar}>
        <p className={styles.logo}>MythicMaker</p>
        <button onClick={onSettingsClick} className={styles.settingsButton}>
          ⚙️ Settings
        </button>
    </nav>
  )
}

export default Navbar