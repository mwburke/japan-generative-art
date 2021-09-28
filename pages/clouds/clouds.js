const canvas_size_multiplier = 0.5;

const canvas_width = 1920 * canvas_size_multiplier;
const canvas_height = 1080 * canvas_size_multiplier;

const debug = true;


function setup() {
    createCanvas(canvas_width, canvas_height, WEBGL);
    smooth(8);

}


function draw() {
    background(200);

    let left_shift = -width / 3;
    translate(left_shift, 0);

    let max_x = width * 2 / 5;


    let horizontal_bounds = [
        [canvas_width * 0.1, canvas_width * 0.4],
        [canvas_width * 0.15, canvas_width * 0.5],
        [canvas_width * 0.1, canvas_width * 0.35]
    ];


    let connections = [canvas_width * 0.3, canvas_width * 0.25];  // , canvas_width * 0.4];

    let cloud_height = canvas_height * 0.05;

    stroke(0);
    strokeWeight(2);
    // fill(0);
    noFill();
    draw_egasumi(horizontal_bounds, connections, cloud_height);
    noLoop();
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
    curveTightness(10);
    const num_rows = horizontal_bounds.length;
    const num_points = 10;

    beginShape();
    // Downwards iteration on right hand side
    for (let i = 0; i < num_rows; i++) {
        // stroke(random() * 255, random() * 255, random() * 255);
        // If first line, then create a single vertex at the leftmost part of the top straight line
        // Otherwise, we don't need one since we have already looped around to out starting point
        if (i == 0) {
            vertex(horizontal_bounds[i][0] + cloud_height / 2, 0);

            point(horizontal_bounds[i][0] + cloud_height / 2, 0);
        } else {
            // curveVertex(connections[i] + cloud_height, cloud_height * (i * 2));
        }


        // Create the right hand curves for each horizontal segment
        curveVertex(horizontal_bounds[i][1] - cloud_height, cloud_height * i * 2);
        for (let j = 0; j <= num_points; j++) {
            curveVertex(
                horizontal_bounds[i][1] - cloud_height / 2 + cos(PI / 2 - PI * j / num_points) * cloud_height / 2,
                cloud_height * (i * 2 + 0.5) - sin(PI / 2 - PI * j / num_points) * cloud_height / 2
            );
        }
        curveVertex(horizontal_bounds[i][1] - cloud_height, cloud_height * (i * 2 + 1));

        if (debug) {
            point(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * i * 2);
            point(horizontal_bounds[i][1] - cloud_height / 2 + cloud_height / 2, cloud_height * (i * 2 + 0.5));
            point(horizontal_bounds[i][1] - cloud_height / 2, cloud_height * (i * 2 + 1));
        }


        // Go back to the left and do the left curve if it's not the bottom row
        if (i < (num_rows - 1)) {

            curveVertex(connections[i] + cloud_height * 2, cloud_height * (i * 2 + 1));
            for (let j = 0; j <= num_points; j++) {
                curveVertex(
                    connections[i] + cloud_height + cos(PI / 2 + PI * j / num_points) * cloud_height / 2,
                    cloud_height * (i * 2 + 1.5) - sin(PI / 2 + PI * j / num_points) * cloud_height / 2
                );
            }
            curveVertex(connections[i] + cloud_height * 2, cloud_height * (i * 2 + 2));

            if (debug) {
                point(connections[i] + cloud_height, cloud_height * (i * 2 + 1));
                point(connections[i] + cloud_height / 2, cloud_height * (i * 2 + 1.5));
                point(connections[i] + cloud_height, cloud_height * (i * 2 + 2));
            }
        }
    }

    //Upwards iteration doing the same thing but up to the left
    for (let i = num_rows - 1; i >= 0; i--) {
        // Draw leftmost curves
        curveVertex(horizontal_bounds[i][0] + cloud_height * 2, cloud_height * (i * 2 + 1));
        for (let j = 0; j <= num_points; j++) {
            curveVertex(
                horizontal_bounds[i][0] + cloud_height / 2 - cos(PI * 3 / 2 + PI * j / num_points) * cloud_height / 2,
                cloud_height * (i * 2 + 0.5) - sin(PI * 3 / 2 + PI * j / num_points) * cloud_height / 2
            );
        }
        curveVertex(horizontal_bounds[i][0] + cloud_height * 2, cloud_height * (i * 2));

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
                    connections[i - 1] - cloud_height - cos(PI * 3 / 2 - PI * j / num_points) * cloud_height / 2,
                    cloud_height * (i * 2 - 0.5) - sin(PI * 3 / 2 - PI * j / num_points) * cloud_height / 2
                );
            }
            curveVertex(connections[i - 1] - cloud_height * 2, cloud_height * (i * 2 - 1));

            if (debug) {
                if (debug) {
                    point(connections[i - 1] - cloud_height, cloud_height * (i * 2));
                    point(connections[i - 1] - cloud_height / 2, cloud_height * (i * 2 - 0.5));
                    point(connections[i - 1] - cloud_height, cloud_height * (i * 2 - 1));
                }
            }
        }
    }

    endShape(CLOSE);
    pop();
}


function generate_egasumi_shape() {

}
