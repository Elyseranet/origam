/**
 * COUNTRY_CENTROIDS
 *
 * Visual centroid [x, y] for each country in `WORLD_MAP_PATHS`,
 * on the same 1000 × 500 Mercator canvas.
 *
 * Used as endpoints for flight-routes Bezier curves.
 * Values approximate the geographic centre of each country shape.
 */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
    US: [122, 130],
    CA: [120, 66],
    MX: [124, 178],
    BR: [258, 252],
    AR: [245, 345],
    CL: [222, 348],
    PE: [218, 260],
    CO: [212, 220],
    GB: [452, 96],
    FR: [470, 124],
    DE: [504, 112],
    IT: [500, 152],
    ES: [468, 152],
    PT: [440, 152],
    NL: [498, 100],
    BE: [484, 108],
    PL: [538, 110],
    SE: [522, 74],
    NO: [508, 60],
    FI: [544, 62],
    GR: [530, 158],
    TR: [575, 154],
    RU: [730, 68],
    CN: [775, 135],
    JP: [852, 130],
    KR: [835, 150],
    IN: [708, 204],
    TH: [764, 208],
    SG: [778, 230],
    ID: [812, 250],
    ZA: [548, 352],
    EG: [572, 194],
    NG: [504, 262],
    AU: [845, 330],
    NZ: [932, 362]
}
