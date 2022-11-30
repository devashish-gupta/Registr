import React from 'react'
import styles from '../styles/ProgressBar.module.css'

const ProgressBar = ({ text, num, den, variant }) => {
    if(variant === "%") {
        return (
            <div className={styles.container}>
                <div className={styles.slotbar}>
                    <div className={styles.slot}/>
                    <div style={{ position: 'relative',
                                    marginTop: '-10px',
                                    marginLeft: '0px',
                                    background: 'linear-gradient(80deg, #3d74b5, #5d42d3)',
                                    borderRadius: '50px',
                                    height: '10px',
                                    width: `${(den !== 0) ? Math.round((num/den)*200) : 0}px` }}/>
                </div>
            </div>
        )
    } else {
        return (
            <div className={styles.container}>
                <div className={styles.text}>{text}</div>
                <div className={styles.slotbar}>
                    <div className={styles.slot}/>
                    <div style={{ position: 'relative',
                                    marginTop: '-10px',
                                    marginLeft: '0px',
                                    background: 'linear-gradient(80deg, #3d74b5, #5d42d3)',
                                    borderRadius: '50px',
                                    height: '10px',
                                    width: `${(den !== 0) ? Math.round((num/den)*200) : 0}px` }}/>
                </div>
                <div className={styles.numden}>{num + " / " + den}</div>
            </div>
        )
    }
}

export default ProgressBar;
