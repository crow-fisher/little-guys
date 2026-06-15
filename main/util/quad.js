// credit to @cfrag: https://forum.dcs.world/topic/352600-check-if-a-point-is-within-a-quad-point-zone/

export function isPointInsideQuad(offset, rs1, rs2, rs3, rs4) {
    // Inside test (only convex polygons): 
	// point lies on the same side of each quad's vertex AB, BC, CD, DA
	// how do we find out which side a point lies on? via the cross product
	// see isLeft below

	// so all we need to do is make sure all results of isLeft for all
	// four sides are the same 

	let mustMatch = isLeftXZ(rs1, rs2, offset);
	if (isLeftXZ(rs2, rs3, offset != mustMatch))
        return false 
	if (isLeftXZ(rs3, rs4, offset != mustMatch))
        return false
	if (isLeftXZ(rs4, rs1, offset != mustMatch))
        return false
	return true
}

function isLeftXZ(A, B, P) {
	return ((B[0] - A[0])*(P[2] - A[2]) - (B[2] - A[2])*(P[0] - A[0])) > 0;
}