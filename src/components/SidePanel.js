import React, { useState } from 'react'
import SearchArea from './SearchArea'
import ListArea from './ListArea'

import styles from '../styles/SidePanel.module.css'
import { useNavigate } from 'react-router'

const SidePanel = ({ courseTree, savePlan }) => {

    const [isDim, setIsDim] = useState(false);
    const [coreAreas, setCoreAreas] = useState(Object.keys(courseTree));
    const [classifiedCourses, setClassifiedCourses] = useState(Object.values(courseTree));
    const navigate = useNavigate();

    return (
        <div>
            <div className={styles.container}>
                <h3 className={styles.title} onClick={() => { savePlan(); navigate("/"); }} title="Home">registr.</h3>
                <SearchArea setIsDim={setIsDim} coreAreas={coreAreas} classifiedCourses={classifiedCourses}/>
                <ListArea coreAreas={coreAreas} classifiedCourses={classifiedCourses}/>
                {
                    (isDim)
                    ?
                    <></>
                    :
                    <div className={styles.creds} onClick={() => {}}>
                        <div style={{ flex: 1 }}/>
                        <div className={styles.cred_text}>Copyright (c) 2022, Devashish Gupta</div>
                    </div>  
                }
            </div>
            <div className={isDim ? styles.dimmer_on : styles.dimmer_off}/>
        </div>
    )
}

export default SidePanel;
