let orange, red, dark_red, dark_gray, black;
let pg;
let clouds;
let cloud_height;
let cloud_frame_move_x;
let cloud_prob_per_second;
const target_framerate = 60;

/**
 * We create a separate PGraphics object to draw the main bulk of the drawing
 * including sky, mountain, sun, Torii gate, etc and draw the clouds separately.
 * The rest will be handled with arrays of clouud/wave objects and drawn for each frame.
 * This should reduce the load of what needs to be recreated and drawn every frame and
 * (hopefully) let this be a realtime wallpaper kinda feel of a website.
 */


function setup() {
    // Initialize various p5js specific stuff like colors
    orange = color(250, 120, 55);
    red = color(194, 4, 4);
    dark_red = color(99, 6, 6);
    dark_gray = color(51, 51, 51);
    black = color(0);
    console.log(windowWidth, windowHeight);
    pg = createGraphics(windowWidth, windowHeight, WEBGL);
    draw_static_graphics();

    frameRate(target_framerate);
    initialize_clouds();

    createCanvas(windowWidth, windowHeight);
    curveTightness(1.1);
}


function draw() {
    image(pg, 0, 0);
    handle_clouds();
    draw_clouds();
}


function draw_static_graphics() {
    pg.clear();
    draw_sky();
    draw_sun();
    draw_mountain();
    draw_sea();
}


function draw_sky() {
    // Top then bottom
    const color_pairs = [
        [
            color(73, 163, 227),
            color(146, 214, 247)
        ]
    ]

    const width = windowWidth;
    const height = windowHeight;

    const color_pair = random_from_array(color_pairs);
    const top_color = color_pair[0];
    const bottom_color = color_pair[1];

    console.log(color_pair);
    console.log(width, height);

    pg.push();
    pg.translate(-width / 2, -height / 2);
    pg.colorMode(RGB);
    pg.noStroke();

    pg.beginShape();
    pg.fill(top_color);
    pg.vertex(0, 0);
    pg.fill(top_color);
    pg.vertex(width, 0);
    pg.fill(bottom_color);
    pg.vertex(width, height);
    pg.fill(bottom_color);
    pg.vertex(0, height);
    pg.endShape(CLOSE);
    pg.pop();
}


function draw_sun() {
    pg.push();
    pg.translate(0, -windowHeight * 0.1);
    pg.noStroke();
    pg.fill(color(173, 7, 21));
    // Tried sphere to get nice round shape but 3D is messing i tup
    // pg.sphere(windowHeight * 0.2, 100, 100);
    // pg.circle(0, 0, windowHeight * 0.5);
    const radius = windowHeight * (0.3 + centered_random() * 0.1);
    webgl_circle(pg, radius);
}


function draw_mountain() {
    // Fuji-esque mountain
    // Basic triangle with truncated top, snow peak

    const mountain_top_color = color(59, 81, 110);
    const mountain_bottom_color = color(173, 187, 204);

    // console.log(windowHeight);
    const m_height = windowHeight * (0.5 + centered_random() * 0.1);
    const m_width = windowWidth * (0.6 + centered_random() * 0.1);
    const m_top_width = windowWidth * (0.07 + centered_random() * 0.04);

    pg.push();
    pg.translate(0, windowHeight * 0.4);

    // Base mountain color
    pg.noStroke();
    // pg.stroke(0);
    // pg.strokeWeight(m_height * 0.01);
    pg.beginShape();
    pg.fill(mountain_bottom_color);
    pg.vertex(-m_width / 2, 0);
    pg.vertex(m_width / 2, 0);
    pg.fill(mountain_top_color);
    pg.vertex(m_top_width / 2, -m_height);
    pg.vertex(-m_top_width / 2, -m_height);
    pg.endShape(CLOSE);
    pg.pop();

    // Mountain snow
    const num_snow_points = 11;
    const noise_val_scale = 1;
    const noise_scale = m_height * 0.1;
    const snow_frac = 0.15 + centered_random() * 0.05;

    pg.push();
    pg.translate(0, windowHeight * 0.4);
    pg.fill(color(247, 247, 247));
    // pg.stroke(0);
    // pg.strokeWeight(m_height * 0.01);
    pg.noStroke();
    pg.beginShape();
    pg.vertex(
        lerp(
            m_top_width / 2,
            m_width / 2,
            snow_frac
        ),
        lerp(
            -m_height, 0, snow_frac
        )
    )

    pg.vertex(m_top_width / 2, -m_height);
    pg.vertex(-m_top_width / 2, -m_height);

    pg.vertex(
        lerp(
            -m_top_width / 2,
            -m_width / 2,
            snow_frac
        ),
        lerp(
            -m_height, 0, snow_frac
        )
    )

    const start_x_point = lerp(
        -m_top_width / 2,
        -m_width / 2,
        snow_frac
    );
    const end_x_point = lerp(
        m_top_width / 2,
        m_width / 2,
        snow_frac
    );
    for (let i = 1; i < num_snow_points; i++) {
        pg.vertex(
            lerp(start_x_point, end_x_point, i / num_snow_points),
            lerp(
                -m_height, 0, snow_frac
            ) + int(i % 2 == 0) * noise_scale + centered_random() * noise_scale / 4
        );
    }
    pg.vertex(
        lerp(
            m_top_width / 2,
            m_width / 2,
            snow_frac
        ),
        lerp(
            -m_height, 0, snow_frac
        )
    )
    pg.endShape();
    pg.pop();

}


function draw_sea() {
    // TODO: Use seigaiha functions for this
    const row_ratio = 1;
    const radius = windowWidth * 0.05;

    const colors = [
        color(4, 0, 128),
        color(237, 237, 237),
        color(104, 168, 252),
        // color(21, 55, 130),
        // color(13, 1, 69)
    ];
    let draw_funcs = shuffle(pgraphics_segaiha_draw_funcs);
    draw_funcs = draw_funcs.slice(0, Math.ceil(Math.random() * 2));

    const torii_row = 3; // TODO: randomize?

    pg.push();
    // TODO: figure out where to translate from and where to stop
    pg.translate(-windowWidth / 2, windowHeight * 0.4);
    for (let j = 0; j < windowHeight / (radius * row_ratio) + 4; j++) {

        if (j == torii_row) {
            draw_torii();
        }

        const x_offset = (j % 2) * radius;
        for (let i = 0; i < windowWidth / radius + 2; i++) {
            const draw_func = draw_funcs[Math.floor(Math.random() * draw_funcs.length)];
            const num_layers = 3 + Math.floor(Math.random() * 5);
            let fill_ratios;
            if (Math.random() < 0.3) {
                let raw_ratios = [];
                for (let i = 0; i < num_layers; i++) {
                    raw_ratios.push(0.6 + Math.random());
                }
                fill_ratios = normalize(raw_ratios);
            } else {
                fill_ratios = predefined_fill_ratios[Math.floor(Math.random() * predefined_fill_ratios.length)];
            }

            pg.push();
            pg.translate(x_offset + i * radius * 2, j * radius / 2 * row_ratio);
            draw_func(pg, radius, colors, num_layers, fill_ratios);
            pg.pop();
        }
    }
    pg.pop();
}


function draw_torii() {
    // TODO: Figure out if we should draw this inb etween waves
    // probably, just need to integrate them, maybe add this into the draw_sea functioN?


    const post_height = windowHeight * 0.3;
    const post_width = post_height * 0.8;
    const max_angle = PI / 30;
    const max_curve_angle = PI / 16
    const torii_params = generate_torii(post_height, post_width, max_angle, max_curve_angle);

    pg.push();
    pg.translate(windowWidth * (0.3 + int(Math.random() < 0.5) * 0.4), windowHeight * 0.1);
    pgraphics_draw_torii(pg, ...torii_params);
    pg.pop();
}


function generate_cloud_color() {
    return color(230 + Math.random() * 20);
}


function initialize_clouds() {
    const cloud_move_secs = 15;
    cloud_frame_move_x = windowWidth / (target_framerate * cloud_move_secs);

    // cloud size bounds
    cloud_height = windowHeight * 0.05;

    const num_start_clouds = Math.floor(Math.random() * 5);

    clouds = [];
    for (let i = 0; i < num_start_clouds; i++) {
        clouds.push({
            'cloud_params': generate_cloud_object(),
            'x': windowWidth * (0.1 + 0.9 * Math.random()),
            'y': windowHeight * Math.random() * 0.3,
            'filled': true, // TODO: revise?
            'color': generate_cloud_color()
        });
    }

    cloud_prob_per_second = 0.3;

    console.log(clouds);
}


function generate_cloud_object() {
        const num_cloud_rows = 2 + Math.floor(Math.random() * 1);
        const x_width = windowWidth * 0.1 + Math.random() * windowWidth * 0.1;
        const y_width = num_cloud_rows * (cloud_height * 2 + 1.05);

        const shape_points = [
            [0, 0],
            [x_width, 0],
            [x_width, y_width],
            [0, y_width]
        ];

        const min_gap = 0;
        const max_bounds = false;
        let min_connections = true;
        let max_connections = false;


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

        return [horizontal_bounds, connections];
}


function handle_clouds() {
    let new_clouds = [];

    clouds.forEach(function(cloud) {
        if (cloud.x > -windowWidth * 0.2) {
            cloud.x -= cloud_frame_move_x;
            new_clouds.push(cloud);
        }
    })

    clouds = new_clouds;

    if (Math.random() < (cloud_prob_per_second / target_framerate)) {
        clouds.push({
            'cloud_params': generate_cloud_object(),
            'x': windowWidth * (1 + Math.random() * 0.2),
            'y': windowHeight * Math.random() * 0.3,
            'filled': true, // TODO: revise?
            'color': generate_cloud_color()
        });
    }
}


function draw_clouds() {
    // Remove them when out of screen and create new ones as they disappear
    // These will be drawn on the regular canvas rather than the static PGraphics object

    clouds.forEach(function(cloud_obj) {
        push();
        translate(cloud_obj['x'], cloud_obj['y']);
        fill(cloud_obj['color']);
        noStroke();
        draw_egasumi(cloud_obj['cloud_params'][0], cloud_obj['cloud_params'][1], cloud_height);
        pop();
    })
}




