class Coord {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

class Haversine {

    static R = 6371; // km

    /**
     * Chuyển đổi độ sang radian.
     * @param {number} deg - Giá trị độ.
     * @returns {number} Giá trị radian.
     */
    static toRad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Tính khoảng cách giữa hai tọa độ bằng công thức Haversine.
     * @param {Coord} coord1 - Tọa độ điểm thứ nhất.
     * @param {Coord} coord2 - Tọa độ điểm thứ hai.
     * @returns {number} Khoảng cách giữa hai điểm (km).
     */
    static distance(coord1, coord2) {
        const dLat = this.toRad(coord2.latitude - coord1.latitude);
        const dLon = this.toRad(coord2.longitude - coord1.longitude);

        const lat1 = this.toRad(coord1.latitude);
        const lat2 = this.toRad(coord2.latitude);

        // a là bình phương của một nửa dây cung
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        // c là khoảng cách góc theo radian
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // d là khoảng cách cuối cùng
        const d = Haversine.R * c;

        return d;
    }
};

module.exports = { Coord, Haversine };