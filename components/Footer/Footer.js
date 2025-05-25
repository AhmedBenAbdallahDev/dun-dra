import styles from './Footer.module.css'

function Footer() {
  return (
    <div className={styles.main}>@2022 Alperen Üstün. This app employs a language model of <a className={styles.link} href="https://beta.openai.com/" target="_blank" rel="noopener noreferrer">OpenAI</a></div>
  )
}

export default Footer