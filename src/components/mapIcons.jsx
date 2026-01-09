import L from "leaflet";
import ReactDOMServer from "react-dom/server";

import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import FloodIcon from "@mui/icons-material/Flood";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import ForestIcon from "@mui/icons-material/Forest";
import TsunamiIcon from "@mui/icons-material/Tsunami";
import AcUnitIcon from "@mui/icons-material/AcUnit";

/* 🎨 ICON + COLOR MAP */
const ICON_CONFIG = {
  earthquake: {
    Icon: CrisisAlertIcon,
    color: "#ef4444", // red
  },
  wildfire: {
    Icon: LocalFireDepartmentIcon,
    color: "#f97316", // orange
  },
  flood: {
    Icon: FloodIcon,
    color: "#92400e", // brown
  },
  rainfall: {
    Icon: ThunderstormIcon,
    color: "#3b82f6", // blue
  },
  deforestation: {
    Icon: ForestIcon,
    color: "#22c55e", // green
  },
  oceans: {
    Icon: TsunamiIcon,
    color: "#2563eb", // deep blue
  },
  snow: {
    Icon: AcUnitIcon,
    color: "#38bdf8", // sky blue
  },
};

export function createMapIcon(type = "earthquake") {
  const { Icon, color } =
    ICON_CONFIG[type] || ICON_CONFIG.earthquake;

  return L.divIcon({
  className: `custom-map-icon ${type}`,
  html: ReactDOMServer.renderToString(
    <div className="icon-wrapper">
      <Icon
        style={{
          color,
          fontSize: "30px",
          filter: "drop-shadow(0 0 6px rgba(0,0,0,0.4))",
        }}
      />
      <span className="pulse-ring" />
    </div>
  ),
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -16],
});
}
