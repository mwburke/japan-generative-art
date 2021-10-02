function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// p is the time between 0 and 1
// g is the strength of the easing
// muptiply times whatever thing you want to ease
function ease(p, g) {
  if (p < 0.5) {
    return 0.5 * pow(2*p, g);
  } else {
    return 1 - 0.5 * pow(2*(1 - p), g);
  }
}


// Helpful statistics scripts
// https://observablehq.com/@nstrayer/javascript-statistics-snippets

function gen_expon(lambda){
  return -Math.log(1-Math.random())/lambda;
}

function gen_pois(lambda, max_its = 1000){
  let i = -1, cum_sum = 0;
  while(cum_sum < 1 && i < max_its){
    i++;
    cum_sum += -Math.log(1-Math.random())/lambda;  // Or use gen_expon()
  }
  return i;
}

function gen_discrete_unif(min = 0, max = 100){
  const range = max - min;

  return Math.round(Math.random()*range) + min;
}

// Array helpers

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function copy_array(arr){
  return arr.map(obj => Object.assign({}, obj));
}

function weighted_sample(weights, values){
  const random_val = Math.random();
  let cumulative_prob = 0, i;
  for(i = 0; i < weights.length; i++){
    cumulative_prob += weights[i];
    if(cumulative_prob > random_val) break;
  }
  // If we have values, return which one, otherwise just return index
  return values ? values[i]: i;
}

function product(arr){
  return arr.reduce((p, d) => p*d, 1);
}

function sum(arr){
  return arr.reduce((s, el) => s + el, 0);
}

function normalize(arr){
  const total_size = arr.reduce((s, el) => s + el, 0);
  // or sum(arr);
  return arr.map(el => el/total_size);
}

function unique(vec){
  return [...new Set(vec)];
}


function distance(v1, v2) {
    return ((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2)**0.5
}

function bounding_box(points) {
  const min_x = points.reduce((min, p) => p[0] < min ? p[0] : min, points[0][0]);
  const max_x = points.reduce((max, p) => p[0] > max ? p[0] : max, points[0][0]);
  const min_y = points.reduce((min, p) => p[1] < min ? p[1] : min, points[0][1]);
  const max_y = points.reduce((max, p) => p[1] > max ? p[1] : max, points[0][1]);

  return [min_x, min_y, max_x, max_y];
}


function intersect_point(point1, point2, point3, point4) {
   const ua = ((point4[0] - point3[0]) * (point1[1] - point3[1]) -
             (point4[1] - point3[1]) * (point1[0] - point3[0])) /
            ((point4[1] - point3[1]) * (point2[0] - point1[0]) -
             (point4[0] - point3[0]) * (point2[1] - point1[1]));

  const ub = ((point2[0] - point1[0]) * (point1[1] - point3[1]) -
             (point2[1] - point1[1]) * (point1[0] - point3[0])) /
            ((point4[1] - point3[1]) * (point2[0] - point1[0]) -
             (point4[0] - point3[0]) * (point2[1] - point1[1]));

  const x = point1[0] + ua * (point2[0] - point1[0]);
  const y = point1[1] + ua * (point2[1] - point1[1]);

  let out_of_bounds = false;
  if ((ua < 0) | (ua > 1) | (ub < 0) | (ub > 1)) {
    out_of_bounds = true;
  }

  return [x, y, out_of_bounds]
}

function find_min_intersect_segment(point1, point2, points) {
  let dist = 100000000000000;
  let draw_points, res, intersect1, intersect2, intersect_dist;

  for (let i = 0; i < points.length; i++) {
    res = intersect_point(point1, point2, points[i], points[(i + 1) % points.length]);
    if (res[2]) {
      continue;
    } else {
      intersect1 = [res[0], res[1]];
    }
    for (let j = i + 1; j < points.length; j++) {
      res =  intersect_point(point1, point2, points[(j) % points.length], points[(j + 1) % points.length]);
      if (res[2]) {
      continue;
      } else {
        intersect2 = [res[0], res[1]];
      }
      intersect_dist = distance(intersect1, intersect2);
      if (intersect_dist <= dist) {

        dist = intersect_dist;
        draw_points = [intersect1, intersect2];
      }
    }
  }
  return draw_points;
}


function polygon_points(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let points = [];
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;

    points.push([sx, sy]);
  }
  return points;
}



function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


function get_min_index(points) {
    let values = [];
    let min_values = [];

    for (let i = 0; i < points.length - 1; i++) {
        let col_points = [];
        for (let j = 0; j < points.length; j++) {
            if (j != i) {
                col_points.push(distance(points[i], points[j]));
            }
        }
        values.push(col_points);
        min_values.push(min(col_points));
    }

    const point_index = get_arr_min_index(min_values);
    return [point_index, min_values[point_index]];
}


function get_arr_min_index(arr) {
    return arr.reduce((iMax, x, i, arr) => x < arr[iMax] ? i : iMax, 0)
}
