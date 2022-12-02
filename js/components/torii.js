const canvas_size_multiplier = 0.5;

const canvas_width = 1920 * canvas_size_multiplier;
const canvas_height = 1080 * canvas_size_multiplier;

const debug = false;

let orange, red, dark_red, dark_gray, black;


function setup() {
    createCanvas(canvas_width, canvas_height);
    translate(width / 2, height * 3 / 4);

    orange = color(250, 120, 55);
    red = color(194, 4, 4);
    dark_red = color(99, 6, 6);
    dark_gray = color(51, 51, 51);
    black = color(0);

    noLoop();

    generate();
}

function generate() {
    clear();
    background(200);

    const post_height = height / 2;
    const post_width = width / 4;
    const max_angle = PI / 30;
    const max_curve_angle = PI / 16
    const torii_params = generate_torii(post_height, post_width, max_angle, max_curve_angle);

    draw_torii(...torii_params);
}


function keyPressed() {
    if (key == 'r') {
        generate();
    }
}


function generate_torii(raw_post_height, raw_post_width, max_angle, max_curve_angle) {
    let post_height = post_base_width = post_width = post_angle = crossbar_width_ratio = crossbar_height = crossbar_offset = has_crossbar_middle = top_style = top_thickness = top_layers = top_decorations = has_base = base_height = base_sock_height =  base_width = base_base_color =  base_color = accent_color = null;

    // Generate post params
    post_height = raw_post_height * (1 + (Math.random() - 0.5) * 0.1);
    post_base_width = raw_post_width * (1 + (Math.random() - 0.5) * 0.1);
    post_width = post_base_width * 0.1 * (1 + Math.random() * 0.5);

    if (Math.random() < 0.5) {
        post_angle = PI / 2;
    } else {
        post_angle = PI / 2 - max_angle * Math.random();
    }

    // Generate colors
    if (Math.random() < 0.3) {
        base_color = orange;
        if (Math.random() < 0.5) {
            accent_color = dark_gray;
        } else {
            accent_color = black;
        }
    } else {
        base_color = red;
        const accent_num = Math.random();
        if (accent_num < 0.4) {
            accent_color = dark_red;
        } else if (accent_num < 0.7) {
            accent_color = dark_gray;
        } else {
            accent_color = black;
        }
    }

    // Generate base stuff
    if (Math.random() < 0.5) {
        has_base = true;
        base_height = post_height * (0.05 + 0.1 * Math.random());
        if ((accent_color == dark_gray) | (accent_color == black)) {
            if (Math.random() < 0.5) {
                base_sock_height = base_height * 2.5;
            }
        }

        base_width = post_width * (1.5 + 2 * Math.random());
        // Always do base color
        if (Math.random() < 1.0) {
            base_base_color = accent_color;
        } else {
            base_base_color = base_color;
        }

    } else {
        has_base = false;
        base_base_color = accent_color;
    }

    // Generate base stuff
    crossbar_height = post_width;
    crossbar_offset = post_height * (0.15 + Math.random() * 0.2);
    crossbar_width_ratio = 1 + (Math.random() < 0.5) * (0.5 + 0.05 * Math.random());
    if (Math.random() < 0.4) {
        has_crossbar_middle = true;
    } else {
        has_crossbar_middle = false;
    }


    // Generate top decorations
    // TODO: this

    // Generate top stuff

    const top_style_num = Math.random();

    if (top_style_num < 0.3) {
        top_style = 'flat';
        top_layers = Math.random() < 0.3 ? 2 : 1;
    } else if (top_style_num < 0.6) {
        top_style = 'flat_curve';
        top_layers = Math.ceil(Math.random() * 2);
    } else {
        top_style = 'curve';
        top_layers = Math.ceil(Math.random() * 3);
    }

    top_thickness = post_width * (1 + 0.2 * Math.random());


    return [post_height, post_base_width, post_width, post_angle, crossbar_width_ratio, crossbar_height, crossbar_offset, has_crossbar_middle, top_style, top_thickness, top_layers, top_decorations, has_base, base_height, base_sock_height, base_width, base_base_color, base_color, accent_color];
}



function draw_torii(post_height, post_base_width, post_width, post_angle, crossbar_width_ratio, crossbar_height, crossbar_offset, has_crossbar_middle, top_style, top_thickness, top_layers, top_decorations, has_base, base_height, base_sock_height, base_width, base_base_color,  base_color, accent_color) {

    push();

    // Precalculate data
    strokeWeight(post_width / 8);
    stroke(accent_color);

    const post_bottoms = [
        [-post_base_width / 2, 0],
        [post_base_width / 2, 0]
    ];

    const post_tops = [
        [post_bottoms[0][0] + post_height * cos(post_angle), -post_height],
        [post_bottoms[1][0] - post_height * cos(post_angle), -post_height]
    ];

    const top_width_mult = 0.3 + Math.random() * 0.2;
    let top_pts = [
        [(post_bottoms[0][0] * (1 + top_width_mult) + post_height * cos(post_angle)), -post_height],
        [post_bottoms[1][0] * (1 + top_width_mult) - post_height * cos(post_angle), -post_height]
    ];

    const post_bottom_tops = [
        [post_bottoms[0][0] + base_height * cos(post_angle), -base_height],
        [post_bottoms[1][0] - base_height * cos( post_angle), -base_height]
    ];

    const post_bottom_sock_tops = [
        [post_bottoms[0][0] + base_sock_height * cos(post_angle), -base_sock_height],
        [post_bottoms[1][0] - base_sock_height * cos(post_angle), -base_sock_height]
    ];

    const crossbar_tops = [
        [(post_bottoms[0][0] + (post_height + crossbar_offset) * cos(post_angle)) * crossbar_width_ratio, -post_height + crossbar_offset],
        [(post_bottoms[1][0] - (post_height + crossbar_offset) * cos(post_angle)) * crossbar_width_ratio, -post_height + crossbar_offset]
    ];


    // Draw crossbar middle
    if (has_crossbar_middle) {
        fill(base_color);
        beginShape();
        vertex(0 - crossbar_height / 2, -post_height + crossbar_offset);
        vertex(0 - crossbar_height / 2, -post_height * 1.02);
        vertex(0 + crossbar_height / 2, -post_height * 1.02);
        vertex(0 + crossbar_height / 2, -post_height + crossbar_offset);
        endShape(CLOSE);
    }

    // Draw crossbar
    fill(base_color);
    beginShape();
    vertex(crossbar_tops[0][0], crossbar_tops[0][1]);
    vertex(crossbar_tops[0][0], crossbar_tops[0][1] - crossbar_height);
    vertex(crossbar_tops[1][0], crossbar_tops[1][1] - crossbar_height);
    vertex(crossbar_tops[1][0], crossbar_tops[1][1]);
    endShape(CLOSE);


    // Draw top decorations
    // TODO:

    // Draw posts
    for (let i = 0; i < 2; i++) {
        fill(base_color);
        beginShape();
        vertex(post_bottoms[i][0] - post_width / 2, post_bottoms[i][1]);
        vertex(post_tops[i][0] - post_width / 2, post_tops[i][1]);
        vertex(post_tops[i][0] + post_width / 2, post_tops[i][1]);
        vertex(post_bottoms[i][0] + post_width / 2, post_bottoms[i][1]);
        endShape(CLOSE);
    }

    // Draw base
    if (has_base) {
        for (let i = 0; i < 2; i++) {
            fill(base_base_color);
            beginShape();
            vertex(post_bottoms[i][0] - base_width / 2, post_bottoms[i][1]);
            vertex(post_bottom_tops[i][0] - base_width / 2, post_bottom_tops[i][1]);
            vertex(post_bottom_tops[i][0] + base_width / 2, post_bottom_tops[i][1]);
            vertex(post_bottoms[i][0] + base_width / 2, post_bottoms[i][1]);
            endShape(CLOSE);
        }

        if (base_sock_height != null) {
            for (let i = 0; i < 2; i++) {
                fill(base_base_color);
                beginShape();
                vertex(post_bottoms[i][0] - post_width / 2, post_bottoms[i][1]);
                vertex(post_bottom_sock_tops[i][0] - post_width / 2, post_bottom_sock_tops[i][1]);
                vertex(post_bottom_sock_tops[i][0] + post_width / 2, post_bottom_sock_tops[i][1]);
                vertex(post_bottoms[i][0] + post_width / 2, post_bottoms[i][1]);
                endShape(CLOSE);
            }
        }
    }


    console.log(top_style);

    // Draw top
    if (top_style == 'flat') {
        const wider_top = Math.random() < 0.2;
        const extension_width = int(wider_top) * -top_pts[0][0] * 0.05;

        beginShape();
        vertex(top_pts[0][0], top_pts[0][1]);
        vertex(top_pts[0][0] - extension_width, top_pts[0][1] - top_thickness);
        vertex(top_pts[1][0] + extension_width, top_pts[1][1] - top_thickness);
        vertex(top_pts[1][0], top_pts[1][1]);
        endShape(CLOSE);
    } else if (top_style == 'flat_curve') {
        const extension_width = -top_pts[0][0] * 0.08;
        const num_points = 50;
        const height_multiplier = 0.7;
        let cross_height = top_thickness * height_multiplier;
        let cross_width = top_pts[1][0] * 2 * 1.1;

        // TODO: figure out how to fix the corner bug
        push();
        translate(0, lerp(crossbar_tops[0][1], top_pts[0][1], 0.8));
        for (let i = 0; i < top_layers; i++) {
            curveTightness(1);

            if (i == (top_layers - 1)) {
                fill(base_base_color);
            } else {
                fill(base_color);
            }

            beginShape();
            vertex(-cross_width / 2, 0);
            // Exact vertex caused weird corner artifacts
            vertex(-cross_width / 2 - extension_width, -cross_height * 1.99);
            arc_vertices(cross_width + extension_width * 2, cross_height, 0, -cross_height, num_points, 'right', 'full');
            // vertex(cross_width / 2 + extension_width, -cross_height);
            vertex(cross_width / 2, 0);
            endShape(CLOSE);
            translate(0, -cross_height * 0.6);
            cross_width *= 1.1;
            cross_height *= 1.1;
        }
        pop();
    } else if (top_style == 'curve') {
        // max of 3 layers
        // move up less than the top height so it overlaps? or at lesat the right amount
        // Extend the width of the edges as well
        // Make the top curved, wider than the bottom with only a minor curve

        const height_multiplier = top_layers < 2 ? 1 : 0.5;
        let cross_width = top_pts[1][0] * 2 * 1.1;
        let cross_height = top_thickness * height_multiplier;
        const num_points = 50;

        push();
        curveTightness(1);
        translate(0, lerp(crossbar_tops[0][1], top_pts[0][1], 0.9));
        for (let i = 0; i < top_layers; i++) {
            if (i == (top_layers - 1)) {
                fill(base_base_color);
            } else {
                fill(base_color);
            }

            beginShape();
            arc_vertices(cross_width, cross_height * 0.5, 0, 0, num_points, 'left', 'full');
            arc_vertices(cross_width, cross_height * 0.5, 0, -cross_height, num_points, 'right', 'full');
            endShape(CLOSE);
            translate(0, -cross_height * 1.0);
            cross_width *= 1.1;
            cross_height *= 1.1;
        }
        pop();
    } else if (top_styope == 'side_curve') {

    }
    pop();
}



function arc_vertices(w, h, w_offset, h_offset, num_points, direction = 'left', arc_type='full', center_out=true) {

    const radius = (w ** 2 / (8 * h) + h / 2);
    const half_angle = asin(w / radius / 2);
    const base_angle = PI / 2;
    const right_multiplier = direction == 'right' ? 1 : -1;

    let start_angle, end_angle;

    if (arc_type == 'full') {
        start_angle = base_angle + half_angle * (right_multiplier);
        end_angle = base_angle - half_angle * (right_multiplier);
    } else {
        if (center_out) {
            start_angle = base_angle;
            end_angle = base_angle - half_angle * (right_multiplier);
        } else {
            start_angle = base_angle - half_angle * (right_multiplier);
            end_angle = base_angle;
        }
    }

    for (let i = 0; i <= num_points; i++) {
        let angle;
        if (direction == 'right') {
            angle = lerp(base_angle + half_angle, base_angle - half_angle, i / num_points);
            // console.log('earlier version:', base_angle + half_angle, base_angle - half_angle)
        } else {
            angle = lerp(base_angle - half_angle, base_angle + half_angle, i / num_points);
            // console.log('earlier version:', base_angle - half_angle, base_angle + half_angle)
        }
        curveVertex(
            w_offset + radius * cos(angle),
            h_offset - radius + radius * sin(angle)
        );

        angle = lerp(start_angle, end_angle, i / num_points);
        // console.log(start_angle, end_angle)

        if ((i == 0) | (i == num_points)) {
            if (i == 0) {
                curveVertex(
                    w_offset + radius * cos(angle),
                    h_offset - radius + radius * sin(angle)
                );
            }
            curveVertex(
                w_offset + radius * cos(angle),
                h_offset - radius + radius * sin(angle)
            );
        }
    }
}
