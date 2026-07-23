// credit to @cfrag: https://forum.dcs.world/topic/352600-check-if-a-point-is-within-a-quad-point-zone/

export function isPointInsideQuad(offset, rs1, rs2, rs3, rs4) {
	// Inside test (only convex polygons): 
	// point lies on the same side of each quad's vertex AB, BC, CD, DA
	// how do we find out which side a point lies on? via the cross product
	// see isLeft below

	// so all we need to do is make sure all results of isLeft for all
	// four sides are the same 

	let mustMatch = isLeftXY(rs1, rs2, offset);
	if (isLeftXY(rs2, rs3, offset) != mustMatch)
		return false
	if (isLeftXY(rs3, rs4, offset) != mustMatch)
		return false
	if (isLeftXY(rs4, rs1, offset) != mustMatch)
		return false
	return true
}

function isLeftXY(A, B, p) {
	return ((B[0] - A[0]) * (p.y - A[1]) - (B[1] - A[1]) * (p.x - A[0])) > 0;
}