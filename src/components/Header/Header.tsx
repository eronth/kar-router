import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import './Header.css'

export default function Header() {
  return (<div className="header">
    <h1>
      <span className="star-wrap">
        <FontAwesomeIcon className="star" icon={faStar} />
        <FontAwesomeIcon className="spark spark-1" icon={faStar} />
        <FontAwesomeIcon className="spark spark-2" icon={faStar} />
        <FontAwesomeIcon className="spark spark-3" icon={faStar} />
      </span>
      <span className="highlight">KAR</span>
      <span className="base-text">Router!</span>
    </h1>
  </div>)
};
