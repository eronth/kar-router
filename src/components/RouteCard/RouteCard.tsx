import { RIDER_ICONS, STAR_ICONS } from "../../data/gameData";
import type { Route } from "../../utils/optimizer";
import { formatMs } from "../../utils/time";
import "./RouteCard.css";

export default function RouteCard({ route, rank }: { route: Route; rank: number }) {
  return (<div className="route-card">

    <div className="route-head">
      <span className="rank">#{rank}</span>
      <span className="total">{formatMs(route.totalMs)}</span>
    </div>

    <ul>
      {route.picks.map((pick) => (
        <li key={pick.course}>
          <span className="course" title={pick.course}>
            {pick.course}
          </span>
          <img src={STAR_ICONS[pick.star]} alt={pick.star} title={pick.star} />
          <img
            src={RIDER_ICONS[pick.rider]}
            alt={pick.rider}
            title={pick.rider}
          />
          <span className="time">{formatMs(pick.ms)}</span>
        </li>
      ))}
    </ul>
    
  </div>)
}
