const canvas_size_multiplier = 1;

const canvas_width = 1920 * canvas_size_multiplier;
const canvas_height = 1080 * canvas_size_multiplier;

const debug = false;


function setup() {
    createCanvas(canvas_width, canvas_height);
    noLoop();
    curveTightness(1.1);
    background(240);

    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    let palette_arr = parse_palette(palette);

    const num_clouds = 15;
    const cloud_height = height / 30;

    for (let i = 0; i < num_clouds; i++) {

        const x_offset = -width * 0.1 + width * Math.random() * 1.2;
        const y_offset = height * Math.random() - cloud_height;
        const num_cloud_rows = 2 + Math.floor(Math.random() * 2);
        const x_width = width / 6 + Math.random() * width / 10;
        const y_width = num_cloud_rows * (cloud_height * 2 + 1.05);

        const shape_points = [
            [0, 0],
            [x_width, 0],
            [x_width, y_width],
            [0, y_width]
        ];

        const min_gap = 0;
        const max_bounds = false;
        const min_connections = true;
        const max_connections = false;

        push();
        translate(x_offset, y_offset);

        const res = generate_egasumi_shape(
            shape_points,
            cloud_height,
            min_gap,
            max_bounds,
            min_connections,
            max_connections
        );

        const horizontal_bounds = res[0];
        const connections = res[1];


        palette_arr = shuffle(palette_arr);


        strokeWeight(5);
        stroke(color("#" + palette_arr[0]));

        if (Math.random() < 0.5) {
            fill(color("#" + palette_arr[0]));
        } else {
            noFill();
        }

        draw_egasumi(horizontal_bounds, connections, cloud_height);
        pop();
    }
}


function generate_egasumi_shape(
    shape_points,
    cloud_height,
    min_gap=0,
    max_bounds=false,
    min_connections=false,
    max_connections=false
    ) {

    // Find the max/min x bounds at each cloud row level
    const x_bounds = x_bounds_per_level(cloud_height, shape_points);

    let horizontal_bounds = [];
    let connections = [];

    let prior_row = null;
    // Iterate through the levels bounds and generate bounds
    for (let i = 0; i < x_bounds.length; i++) {
        // Add gap and buffer for rounded part
        // Horizontal bounds are defined as the edges of the straight parts
        const min_x = x_bounds[i][0] + min_gap + cloud_height / 2;
        const max_x = x_bounds[i][1] - min_gap - cloud_height / 2;

        if (max_bounds) {
            horizontal_bounds.push([min_x, max_x]);
        } else {
            const row = generate_cloud_row_bounds(min_x, max_x, cloud_height, prior_row);
            horizontal_bounds.push(row);
            prior_row = row;
        }

    }

    // Iterate through bounds and generate valid connections between them
    for (let i = 1; i < x_bounds.length; i++) {
        const row = horizontal_bounds[i];
        const prior_row = horizontal_bounds[i - 1];
        connections.push(generate_connection(row, prior_row, cloud_height, min_connections, max_connections));
    }

    return [horizontal_bounds, connections];
}

/* Calculate the random left location, then calculate the right hand location.
 * If prior row, then redefine bounds to make sure that
 * the left hand side isn't past the right of the prior and vice versa.
 * Make sure that the right hand is at least 2 times (?) the cloud_height to
 * right hand side of the left side.
 */
function generate_cloud_row_bounds(min_x, max_x, cloud_height, prior_row=null) {

    let left_max;
    let right_min;
    if (prior_row != null) {
        left_max = Math.min(max_x, prior_row[1] - cloud_height * 3);
        right_min = Math.max(min_x, prior_row[0] + cloud_height * 3);
    } else {
        left_max = max_x;
        right_min = min_x;
    }
    // TODO: tweak this to make them longer less regular?
    const left =  min_x + Math.random() * (left_max - min_x - cloud_height * 4);
    if (prior_row == null) {
        right_min = left + cloud_height * 4;
    }
    const right = Math.max(right_min, left + Math.random() * (max_x - left -  4 * cloud_height) + cloud_height * 4);

    return [left, right];
}

function x_bounds_per_level(cloud_height, shape_points) {
    const bounding_box_pts = bounding_box(shape_points);
    const x_min = bounding_box_pts[0];
    const y_min = bounding_box_pts[1];
    const x_max = bounding_box_pts[2];
    const y_max = bounding_box_pts[3];
    let x_bounds = [];
    for (let y = y_min + cloud_height / 2; y <= y_max; y += cloud_height * 2) {
        // Add arbitrary amount on either end to ensure intersection
        const pt1 = [x_min - 100, y];
        const pt2 = [x_max + 100, y];
        const intersect_segment = find_min_intersect_segment(pt1, pt2, shape_points);
        const temp_bounds = [intersect_segment[1][0], intersect_segment[0][0]];
        // console.log('temp_bounds', y, temp_bounds);
        x_bounds.push(temp_bounds);
    }
    return x_bounds;
}

// min_connections and max connections should never both be true
function generate_connection(row, prior_row, cloud_height, min_connections, max_connections) {
    const x_min = Math.max(row[0], prior_row[0]) + cloud_height * 1.5;
    const x_max = Math.min(row[1] , prior_row[1]) - cloud_height * 1.5;

    let left, right;
    if (max_connections) {
        left = x_min;
        right = x_max;
    } else {
        left = x_min + Math.random() * (x_max - x_min);
        if (min_connections) {
            right = left;
        } else {
            right = left + Math.random() * (x_max - left);
        }
    }
    return [left, right];
}

/** Function to draw the egasumi cloud given the inputs
  * All locations based from the top left corner and the y values go from top down according to p5js convention
  * Start at the top and work your way clockwise around all of it.
  *
  * Params:
  * horizontal_bounds: list of lists of the horizontal x coordinates of each horizontal cloud component
  * connections: list of x values of the locations of the vertical connections between horizontal cloud components
                 the list should be one less length than the horizontal bounds
  * cloud_height: height of each horizontal line segent as well as connections
  */
function draw_egasumi(horizontal_bounds, connections, cloud_height) {
    push();
    const num_rows = horizontal_bounds.length;
    const num_points = 30;

    beginShape();
    // Downwards iteration on right hand side
    for (let i = 0; i < num_rows; i++) {
        // stroke(random() * 255, random() * 255, random() * 255);
        // If first line, then create a single vertex at the leftmost part of the top straight line
        // Otherwise, we don't need one since we have already looped around to out starting point
        if (i == 0) {
            curveVertex(horizontal_bounds[i][0] - cloud_height / 2, 0);
            curveVertex(horizontal_bounds[i][0] + cloud_height / 2, 0);
            // vertex(horizontal_bounds[i][0] + cloud_height / 2);

            if (debug) {
                point(horizontal_bounds[i][0] + cloud_height / 2, 0);
            }

        }

        // Create the right hand curves for each horizontal segment
        if (debug) {
            push();
            stroke(0, 255, 0);
            circle(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * i * 2, 10);
            pop();
        }
        // curveVertex(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * i * 2);
        for (let j = 0; j <= num_points; j++) {
            curveVertex(
                horizontal_bounds[i][1] - cloud_height / 2 + cos(PI / 2 - PI * j / num_points) * cloud_height / 2,
                cloud_height * (i * 2 + 0.5) - sin(PI / 2 - PI * j / num_points) * cloud_height / 2
            );
            if (debug) {
                push();
                stroke(255, 0, 0);
                point(
                    horizontal_bounds[i][1] - cloud_height / 2 + cos(PI / 2 - PI * j / num_points) * cloud_height / 2,
                    cloud_height * (i * 2 + 0.5) - sin(PI / 2 - PI * j / num_points) * cloud_height / 2
                );
                pop();
            }
        }
        // curveVertex(horizontal_bounds[i][1] - cloud_height, cloud_height * (i * 2 + 1));

        if (debug) {
            push();
            stroke(0, 0, 255);
            point(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * i * 2);
            point(horizontal_bounds[i][1] - cloud_height / 2 + cloud_height / 2, cloud_height * (i * 2 + 0.5));
            point(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * (i * 2 + 1));
            pop();
        }


        // Go back to the left and do the left curve if it's not the bottom row
        if (i < (num_rows - 1)) {

            // curveVertex(connections[i][1] + cloud_height * 2, cloud_height * (i * 2 + 1));
            for (let j = 0; j <= num_points; j++) {
                // if ((j == 0) | (j == num_points)) {
                //     curveVertex(
                //         connections[i][1] + cloud_height + cos(PI / 2 + PI * j / num_points) * cloud_height / 2,
                //         cloud_height * (i * 2 + 1.5) - sin(PI / 2 + PI * j / num_points) * cloud_height / 2
                //     );
                // }
                curveVertex(
                    connections[i][1] + cloud_height + cos(PI / 2 + PI * j / num_points) * cloud_height / 2,
                    cloud_height * (i * 2 + 1.5) - sin(PI / 2 + PI * j / num_points) * cloud_height / 2
                );
            }
            // curveVertex(connections[i][1] + cloud_height * 2, cloud_height * (i * 2 + 2));

            if (debug) {
                point(connections[i][1] + cloud_height, cloud_height * (i * 2 + 1));
                point(connections[i][1] + cloud_height / 2, cloud_height * (i * 2 + 1.5));
                point(connections[i][1] + cloud_height, cloud_height * (i * 2 + 2));
            }
        }
    }

    //Upwards iteration doing the same thing but up to the left
    for (let i = num_rows - 1; i >= 0; i--) {
        // Draw leftmost curves
        // curveVertex(horizontal_bounds[i][0] + cloud_height * 2, cloud_height * (i * 2 + 1));
        for (let j = 0; j <= num_points; j++) {
            curveVertex(
                horizontal_bounds[i][0] + cloud_height / 2 - cos(PI * 3 / 2 + PI * j / num_points) * cloud_height / 2,
                cloud_height * (i * 2 + 0.5) - sin(PI * 3 / 2 + PI * j / num_points) * cloud_height / 2
            );
        }
        // curveVertex(horizontal_bounds[i][0] + cloud_height * 2, cloud_height * (i * 2));

        if (debug) {
            point(horizontal_bounds[i][0] + cloud_height / 2, cloud_height * (i * 2 + 1));
            point(horizontal_bounds[i][0], cloud_height * (i * 2 + 0.5));
            point(horizontal_bounds[i][0] + cloud_height / 2, cloud_height * (i * 2));
        }

        // If it's not at the top, then draw the rightmost inner curves
        if (i > 0) {
            // curveVertex(connections[i - 1] - cloud_height, cloud_height * (i * 2));
            for (let j = 0; j <= num_points; j++) {
                curveVertex(
                    connections[i - 1][0] - cloud_height - cos(PI * 3 / 2 - PI * j / num_points) * cloud_height / 2,
                    cloud_height * (i * 2 - 0.5) - sin(PI * 3 / 2 - PI * j / num_points) * cloud_height / 2
                );
            }
            // curveVertex(connections[i - 1][0] - cloud_height * 2, cloud_height * (i * 2 - 1));

            if (debug) {
                if (debug) {
                    point(connections[i - 1][0] - cloud_height, cloud_height * (i * 2));
                    point(connections[i - 1][0] - cloud_height / 2, cloud_height * (i * 2 - 0.5));
                    point(connections[i - 1][0] - cloud_height, cloud_height * (i * 2 - 1));
                }
            }
        }
    }

    curveVertex(horizontal_bounds[0][0] + cloud_height / 2, 0);
    curveVertex(horizontal_bounds[0][0] + cloud_height, 0);
    endShape();
    pop();
}






/** Function to draw the egasumi cloud given the inputs
  * Rather than using p5js's beginShape and curveVertex functions which are based on bezier curves,
  * I am using the raw HTML canvas functions since the long straight lines were causing issues.
  * With the canvas functions, we can use plain arcs and straight lines which render fine.
  * All locations based from the top left corner and the y values go from top down according to p5js convention
  * Start at the top and work your way clockwise around all of it.
  *
  * Params:
  * horizontal_bounds: list of lists of the horizontal x coordinates of each horizontal cloud component
  * connections: list of x values of the locations of the vertical connections between horizontal cloud components
                 the list should be one less length than the horizontal bounds
  * cloud_height: height of each horizontal line segent as well as connections
  */
 function draw_egasumi_html_canvas(
    horizontal_bounds,
    connections,
    cloud_height,
    has_stroke=false,
    has_fill=false
    ) {
push();
const num_rows = horizontal_bounds.length;

let ctx = canvas.getContext('2d');
ctx.beginPath();
// Downwards iteration on right hand side
for (let i = 0; i < num_rows; i++) {
    if (i == 0) {
        ctx.moveTo(horizontal_bounds[i][0] - cloud_height / 2, 0);
        ctx.lineTo(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * i * 2);
    } else {
        ctx.moveTo(connections[i - 1][1] + cloud_height / 2, cloud_height * i * 2);
        ctx.lineTo(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * i * 2);
    }

    ctx.arc(
        horizontal_bounds[i][1] - cloud_height / 2,
        cloud_height * (i * 2 + 0.5),
        cloud_height / 2,
        -PI / 2,
        PI / 2,
        false
    );

    // Go back to the left and do the left curve if it's not the bottom row
    if (i < (num_rows - 1)) {
        ctx.moveTo(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * (i * 2 + 1));
        ctx.lineTo(connections[i][1] + cloud_height / 2, cloud_height * (i * 2 + 1));

        ctx.arc(
            connections[i][1] + cloud_height / 2,
            cloud_height * (i * 2 + 1.5),
            cloud_height / 2,
            -PI / 2,
            PI / 2,
            true
        );
    } else {
        // Create the straight line on the bottom?
        ctx.moveTo(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * (i * 2 + 1));
        ctx.lineTo(horizontal_bounds[i][0] + cloud_height / 2, cloud_height * (i * 2 + 1));
    }
}



//Upwards iteration doing the same thing but up to the left

for (let i = num_rows - 1; i >= 0; i--) {
    // Draw the leftmost  curves
    ctx.arc(
        horizontal_bounds[i][0] + cloud_height / 2,
        cloud_height * (i * 2 + 0.5),
        cloud_height / 2,
        - PI / 2,
        PI / 2,
        true
    );

    // If it's not at the top, then draw the rightmost inner curves
    if (i > 0) {
        // Straight line from leftmost curve end to inner connection curve
        ctx.moveTo(horizontal_bounds[i][0] + cloud_height / 2, cloud_height * (i * 2));
        ctx.lineTo(connections[i - 1][0] - cloud_height / 2, cloud_height * (i * 2));

        // Inner connection curve
        ctx.arc(
            connections[i - 1][0] - cloud_height / 2,
            cloud_height * (i * 2 - 0.5),
            cloud_height / 2,
            - PI / 2,
            PI / 2,
            false
        );

        ctx.moveTo(connections[i - 1][0] - cloud_height / 2, cloud_height * (i * 2 - 1));
        ctx.lineTo(horizontal_bounds[i - 1][0] + cloud_height / 2, cloud_height * (i * 2 - 1));
    }
}

if (has_stroke) {
    ctx.stroke();
}
if (has_fill) {
    ctx.fill();
}
ctx.closePath();

pop();
}




const palettes = [
    'https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51',
    'https://coolors.co/03045e-023e8a-0077b6-0096c7-00b4d8-48cae4-90e0ef-ade8f4-caf0f8',
    'https://coolors.co/e63946-f1faee-a8dadc-457b9d-1d3557',
    'https://coolors.co/003049-d62828-f77f00-fcbf49-eae2b7',
    'https://coolors.co/f4f1de-e07a5f-3d405b-81b29a-f2cc8f',
    'https://coolors.co/006d77-83c5be-edf6f9-ffddd2-e29578',
    'https://coolors.co/335c67-fff3b0-e09f3e-9e2a2b-540b0e',
    'https://coolors.co/353535-3c6e71-ffffff-d9d9d9-284b63',
    'https://coolors.co/3d5a80-98c1d9-e0fbfc-ee6c4d-293241',
    'https://coolors.co/588b8b-ffffff-ffd5c2-f28f3b-c8553d',
    'https://coolors.co/780116-f7b538-db7c26-d8572a-c32f27',
    'https://coolors.co/495867-577399-bdd5ea-f7f7ff-fe5f55',
    'https://coolors.co/8cb369-f4e285-f4a259-5b8e7d-bc4b51',
  ]




  function get_palette_colors(palettes, n) {
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    let palette_arr = parse_palette(palette);
    shuffle(palette_arr);
    return palette_arr.slice(0, n);
  }


  function parse_palette(palette_str) {
    // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51
    const base_str = palette_str.substr(19);
    const str_arr = base_str.split('-');
    return str_arr;
  }
