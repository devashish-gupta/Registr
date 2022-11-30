import ListItem from './ListItem'
import styles from '../styles/ListArea.module.css'

const ListArea = ({ coreAreas, classifiedCourses }) => {

    return (
        <div className={styles.container}>
            <h5 className={styles.title}>Core areas</h5>
            <div className={styles.itemcontainer}>
                {
                    coreAreas.map((name, idx) => { return (
                        <ListItem key={name} title={name} courses={classifiedCourses[idx]}/>
                    )})
                }
            </div>
        </div>
    )
}

export default ListArea
