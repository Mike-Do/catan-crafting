import { useMemo } from "react";
import TriangularPrism from "./TriangularPrism.jsx";

export default function Tile(props) {
    const triangularPrisms = useMemo(() => {
        const triangularPrisms = [];

        const members = [
            { cOff: [0, 0, 1 / Math.sqrt(3)], yFlip: true },
            { cOff: [0, 0, -1 / Math.sqrt(3)], yFlip: false },
            { cOff: [1 / 2, 0, 1 / (2 * Math.sqrt(3))], yFlip: false },
            { cOff: [1 / 2, 0, -1 / (2 * Math.sqrt(3))], yFlip: true },
            { cOff: [-1 / 2, 0, 1 / (2 * Math.sqrt(3))], yFlip: false },
            { cOff: [-1 / 2, 0, -1 / (2 * Math.sqrt(3))], yFlip: true }
        ]
        for (let i = 0; i < members.length; i++) {
            const center = [props.center[0] + members[i].cOff[0], props.center[1] + members[i].cOff[1], props.center[2] + members[i].cOff[2]]
            triangularPrisms.push(<TriangularPrism center={center} yFlip={members[i].yFlip} radius={1 / Math.sqrt(3)} level={props.level} />);
        }
        return triangularPrisms;
    }, [props.center, props.level]);

    return (
        <group>
            {triangularPrisms}
        </group>
    );
}