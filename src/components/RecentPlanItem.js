import styles from '../styles/RecentPlanItem.module.css'
import RoundButton from './RoundButton'
import { useRef } from 'react'
import { useNavigate } from 'react-router'

const RecentPlanItem = ({ plan, setPlan, syncPlans, selected, renameActive,
     setRenameActive, updateName }) => {

    const navigate = useNavigate();
    const input = useRef();

    // method to navigate to plan editor
    // Set the plan to the chosen plan (and subsequently take user to course editor)
    const goToPlanEditor = () => {
        setPlan(plan);
        syncPlans();
        navigate("/editor", { state: { direct_access: false }});
    };

    const handleCommit = (event) => {
        if(event.key === "Enter") {
            setRenameActive(false);
            if(input.current.value !== "") {
                updateName(input.current.value);
            }
        } else if(event.key === "Escape" || event.key === "q") {
            setRenameActive(false);
        }
    };

    return (
        <div className={selected ? styles.selected_container: styles.container}>

            <div className={styles.horizontal}>
                {
                    (renameActive && selected)
                    ?
                    <input autoFocus type="text" className={styles.input} onKeyDown={handleCommit} ref={input} defaultValue={plan.name} spellCheck={false}/>
                    :
                    <div className={styles.name}>{plan.name}</div>
                }
                <div className={styles.semester}>{plan.semester + " " + plan.year}</div>
                <RoundButton 
                    name="arrow-right" 
                    onClick={goToPlanEditor}
                    variant={5}
                    tooltip={"Go to plan"}
                    disabled={false}/>
            </div>
            <div className={styles.lmod}>{"Modified " + plan.time + ", " + plan.lmod}</div>
        </div>
    )
}

export default RecentPlanItem;
