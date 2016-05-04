
DEFAULT_ELEVATION  = 0.0;
M_PI = 3.14159265358979323846;
SEMI_MAJOR         = 6378137.0;     // units: meter
SEMI_MINOR         = 6356752.31414; // units: meter
DEG2RAD            = M_PI / 180.0;



//const double latlon[3], double xyz[3]
function latlon2xyz_static(latlon, xyz) {
  with(Math)
  {
    var lat = latlon[0];
    var lon = latlon[1];

    var slat, clat, slon, clon;
    var aslat, bclat, abclat, den;

    slat = sin(lat * DEG2RAD);
    clat = cos(lat * DEG2RAD);
    slon = sin(lon * DEG2RAD);
    clon = cos(lon * DEG2RAD);

    aslat = SEMI_MAJOR * slat;
    bclat = SEMI_MINOR * clat;
    abclat = SEMI_MAJOR * bclat;
    den = sqrt(aslat * aslat + bclat * bclat);
    xyz[0] = abclat * clon / den;
    xyz[1] = abclat * slon / den;
    xyz[2] = SEMI_MINOR * aslat / den;

    //return 0;
  }
}
function SQ(a)
{
  return Math.pow(a,2);
}
// latlon_origin={lat: , lon: }
// p is object
function  compute_latlon_linearize(latlon_origin,p) {
  with(Math)
  {
    p.origin_latlon = {};
    p.origin_latlon[0] = latlon_origin.lat;
    p.origin_latlon[1] = latlon_origin.lon;
    p.origin_latlon[2] = DEFAULT_ELEVATION;

    //double x_axis[3] = {0};
    x_axis={}
    x_axis[0] = p.origin_latlon[0];
    x_axis[1] = p.origin_latlon[1] + 1e-4; // TODO what does the constant 1e-4 represent !?
    x_axis[2] = DEFAULT_ELEVATION;

    //double x1[3], num, den, den_sq, tmp1;
    var x1={};
    var num, den, den_sq, tmp1;
    p.r0={};
    latlon2xyz_static(p.origin_latlon, p.r0);
    latlon2xyz_static(x_axis, x1);
    //double* r0 = p.r0;
    r0 = p.r0;

    den_sq = SQ(r0[0]) + SQ(r0[1]) + SQ(r0[2]);
    x1[0] -= r0[0];
    x1[1] -= r0[1];
    x1[2] -= r0[2];
    tmp1 = (x1[0] * r0[0] + x1[1] * r0[1] + x1[2] * r0[2]) / den_sq;
    x1[0] -= tmp1 * r0[0];  // order is important
    x1[1] -= tmp1 * r0[1];
    x1[2] -= tmp1 * r0[2];
    // x1 now is the vector from origin to x_axis projected onto the tangent
    // plane of the sphere at origin.

    num = 1.0 / sqrt(SQ(x1[0]) + SQ(x1[1]) + SQ(x1[2]));
    p.ax={};
    p.ax[0] = x1[0] * num;
    p.ax[1] = x1[1] * num;
    p.ax[2] = x1[2] * num;

    // az[] is used for local to global transformation
    den = sqrt(den_sq);
    num = 1.0 / den;
    p.az={};
    p.az[0] = r0[0] * num;
    p.az[1] = r0[1] * num;
    p.az[2] = r0[2] * num;

    // TODO call existing cross product function
    p.ay={};
    p.ay[0] = p.az[1] * p.ax[2] - p.az[2] * p.ax[1];
    p.ay[1] = p.az[2] * p.ax[0] - p.az[0] * p.ax[2];
    p.ay[2] = p.az[0] * p.ax[1] - p.az[1] * p.ax[0];

    num = 1.0 / sqrt(SQ(p.ay[0]) + SQ(p.ay[1]) + SQ(p.ay[2]));
    p.ay[0] *= num;
    p.ay[1] *= num;
    p.ay[2] *= num;

    // printf("r0: (%f,%f,%f)\n", r0[0], r0[1], r0[2]);
    // printf("ax: (%f,%f,%f)\n", p.ax[0], p.ax[1], p.ax[2]);
    // printf("ay: (%f,%f,%f)\n", p.ay[0], p.ay[1], p.ay[2]);
    // printf("az: (%f,%f,%f)\n", p.az[0], p.az[1], p.az[2]);
    //return 0;
  }
}

/*
typedef struct {
    double origin_latlon[3];
    double ax[3], ay[3], az[3];
    double r0[3];
} latlon_linearize_params_t;
*/
//const double xyzl[3], const latlon_linearize_params_t& p, double latlon[3]
//angle: rot angle ,degree
function local2latlon_static(xyzl,angle, p, latlon) {
  with(Math)
  {
    //double xyz[3], a, b, c, alpha, alpha1, alpha2;
  var xyz={};
  var a, b, c, alpha, alpha1, alpha2;
    //double discrim, first, second, tmp;
  var discrim, first, second, tmp;
  
  var xx = xyzl[0];
  var yy = xyzl[1];
  xyzl[0] = xx * cos(angle*DEG2RAD) + yy*sin(angle*DEG2RAD);
  xyzl[1] = yy * cos(angle*DEG2RAD) - xx*sin(angle*DEG2RAD);

    xyz[0] = p.ax[0] * xyzl[0] + p.ay[0] * xyzl[1] + p.r0[0];
    xyz[1] = p.ax[1] * xyzl[0] + p.ay[1] * xyzl[1] + p.r0[1];
    xyz[2] = p.ax[2] * xyzl[0] + p.ay[2] * xyzl[1] + p.r0[2];

    // TODO reimplementation of vector*scalar and vector norm
    a = SQ(p.r0[0] / SEMI_MAJOR) + SQ(p.r0[1] / SEMI_MAJOR) +
        SQ(p.r0[2] / SEMI_MINOR);
    b = -2.0 * ((p.r0[0] * xyz[0] + p.r0[1] * xyz[1]) / SQ(SEMI_MAJOR) +
                p.r0[2] * xyz[2] / SQ(SEMI_MINOR));
    c = SQ(xyz[0] / SEMI_MAJOR) + SQ(xyz[1] / SEMI_MAJOR) +
        SQ(xyz[2] / SEMI_MINOR) - 1.0;
    discrim = SQ(b) - 4.0 * a * c;
    //assert(discrim >= 0.0);
    tmp = 0.5 / a;
    first = -b * tmp;
    second = sqrt(discrim) * tmp;
    alpha1 = first + second;
    alpha2 = first - second;
    if (abs(alpha1) < abs(alpha2)) {
        alpha = alpha1;
    } else {
        alpha = alpha2;
    }

    xyz[0] -= alpha * p.r0[0];
    xyz[1] -= alpha * p.r0[1];
    xyz[2] -= alpha * p.r0[2];

    xyz2latlon_static(xyz, latlon);
  } 
}
/**
 * @brief xyz2latlon_static
 * @param xyz
 * @param latlon, latlon[2] is not assigned
 */
//const double xyz[3], double latlon[3]
function xyz2latlon_static(xyz,latlon) {
    with(Math)
  {
    var tmp;
    latlon[1] = atan2(xyz[1], xyz[0]) / DEG2RAD;
    tmp = sqrt(SQ(xyz[0]) + SQ(xyz[1]));
    latlon[0] = atan2(xyz[2], tmp) / DEG2RAD;
  }
}
