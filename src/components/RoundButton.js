import React from 'react'
import Icon from 'react-web-vector-icons'
import styles from '../styles/RoundButton.module.css'

const RoundButton = ({ name, onClick, variant, disabled, tooltip }) => {

    return (
        <div className={styles.unselectable} title={tooltip}>
            { disabled 
                ?
                <div className={styles.disabledroundbutton}>
                    <Icon name={name} font="Feather" size={15} color='rgba(255, 255, 255, 0.8)'/>
                </div>                
                :

                <div className={(variant === 2) ? styles.roundbutton2 : styles.roundbutton5} 
                    onClick={onClick}>
                    <Icon name={name} font="Feather" size={15} color='rgba(255, 255, 255, 0.8)'/>
                </div>
            }
        </div>
    )
}

export default RoundButton;
