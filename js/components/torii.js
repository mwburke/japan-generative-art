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
    background(200);

    const post_height = height / 2;
    const post_width = width / 4;
    const max_angle = PI / 30;
    const max_curve_angle = PI / 16
    const torii_params = generate_torii(post_height, post_width, max_angle, max_curve_angle);

    draw_torii(...torii_params);
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
        if (Math.random() < 0.5) {
            base_base_color = base_color;
        } else {
            base_base_color = accent_color;
        }

    } else {
        has_base = false;
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
        top_layers = 1;
    } else if (top_style_num < 0.6) {
        top_style = 'flat_curve';
        top_layers = Math.ceil(Math.random() * 3);
    } else {
        top_style = 'curve';
        top_layers = Math.ceil(Math.random() * 3);
    }

    top_thickness = post_width * (1 - 0.4 * Math.random());


    return [post_height, post_base_width, post_width, post_angle, crossbar_width_ratio, crossbar_height, crossbar_offset, has_crossbar_middle, top_style, top_thickness, top_layers, top_decorations, has_base, base_height, base_sock_height, base_width, base_base_color, base_color, accent_color];
}



function draw_torii(post_height, post_base_width, post_width, post_angle, crossbar_width_ratio, crossbar_height, crossbar_offset, has_crossbar_middle, top_style, top_thickness, top_layers, top_decorations, has_base, base_height, base_sock_height, base_width, base_base_color,  base_color, accent_color) {

    push();

    // Precalculate data
    strokeWeight(post_width / 10);
    stroke(accent_color);

    const post_bottoms = [
        [-post_base_width / 2, 0],
        [post_base_width / 2, 0]
    ];

    const post_tops = [
        [post_bottoms[0][0] + post_height * cos(post_angle), -post_height],
        [post_bottoms[1][0] - post_height * cos(post_angle), -post_height]
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


    // Draw top
    if (top_style == 'flat') {

    } else if (top_style == 'flat_curve') {

    } else {
        // Curve

    }


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



    pop();
}

