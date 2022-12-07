// const canvas_size_multiplier = 1;

// const canvas_width = 1920 * canvas_size_multiplier;
// const canvas_height = 1080 * canvas_size_multiplier;

// const debug = false;

// let radius;
// let colors;
// let row_ratio = 0.5;

// function setup() {
//     createCanvas(canvas_width, canvas_height);

//     radius = width / 10;

//     colors = [
//         color(4, 0, 128),
//         color(237, 237, 237),
//         color(104, 168, 252),
//         // color(21, 55, 130),
//         // color(13, 1, 69)
//     ];

//     generate();

//     noLoop();
// }

// function keyPressed() {
//     if (key == 's') {
//         save('segaiha.png')
//     }
// }


function generate() {
    let draw_funcs = shuffle(segaiha_draw_funcs);
    draw_funcs = draw_funcs.slice(0, Math.ceil(Math.random() * segaiha_draw_funcs.length - 1));


    for (let j = 0; j < canvas_height / (radius * row_ratio)  * 2 + 2; j++) {
        const x_offset = (j % 2) * radius / 2;
        for (let i = 0; i < canvas_width / radius+ 2; i++) {
            const draw_func = draw_funcs[Math.floor(Math.random() * draw_funcs.length)];
            const num_layers = 3 + Math.floor(Math.random() * 5);
            let fill_ratios;
            if (Math.random() < 0.3) {
                let raw_ratios = [];
                for (let i = 0; i < num_layers; i++) {
                    raw_ratios.push(0.3 + Math.random());
                }
                fill_ratios = normalize(raw_ratios);
            } else {
                fill_ratios = predefined_fill_ratios[Math.floor(Math.random() * predefined_fill_ratios.length)];
            }

            push();
            translate(x_offset + i * radius, j * radius / 2 * row_ratio);
            draw_func(radius, colors, num_layers, fill_ratios);
            pop();
        }
    }
}



function add_grain() {
    // console.log('adding grain');
    for (let i = 0; i < canvas_width; i++) {
        for (let j = 0; j < canvas_height; j++) {
            if (Math.random() < 0.3) {
                noStroke();
                fill(50, 50, 50, 100);
                circle(i, j, 1);
            }
        }
    }
    // console.log('done adding grain');
}




function webgl_circle(pg, radius, npoints = 1000) {
    const angle = TWO_PI / npoints;

    pg.beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = cos(a) * radius;
        let sy = sin(a) * radius;
        pg.vertex(sx, sy);
    }
    pg.endShape(CLOSE);
}




const pgraphics_segaiha_draw_funcs = [


    // Solid fill of the first color in colors
    function pgraphics_segaiha_solid_fill(pg, radius, colors, num_layers, fill_ratios) {
        pg.noStroke();
        pg.fill(colors[0]);
        webgl_circle(pg, radius, 100);
    },


    // Even sized num_layers in the lerping between first and second colors
    function pgraphics_segaiha_lerp_between_first_second(pg, radius, colors, num_layers, fill_ratios) {
        pg.noStroke();
        for (let i = 0; i < num_layers; i++) {
            pg.fill(lerpColor(colors[0], colors[1], i / (num_layers - 1)));
            webgl_circle(pg, (1 - i / num_layers) * radius, 100);
        }
    },

    // Even sized num_layers in the first and second colors in
    function pgraphics_segaiha_even_colors_first_second(pg, radius, colors, num_layers, fill_ratios) {
        pg.noStroke();
        for (let i = 0; i < num_layers; i++) {
            pg.fill(colors[i % 2]);
            webgl_circle(pg, (1 - i / num_layers) * radius, 100);
        }
    },

    // Even sized num_layers with the first one consistently every other
    function pgraphics_segaiha_even_colors_first_second_is_random_constant(pg, radius, colors, num_layers, fill_ratios) {
        let second_color = colors[1 + Math.floor(Math.random() * (colors.length - 1))];
        pg.noStroke();
        for (let i = 0; i < num_layers; i++) {
            if (i % 2 == 0) {
                pg.fill(colors[0]);
            } else {
                pg.fill(second_color);
            }
            webgl_circle(pg, (1 - i / num_layers) * radius, 100)
        }
    },


    // Even sized num_layers with the first one and a random second every other one
    // function pgraphics_segaiha_even_colors_first_second_is_random(pg, radius, colors, num_layers, fill_ratios) {

    //     pg.noStroke();
    //     for (let i = 0; i < num_layers; i++) {
    //         if (i % 2 == 0) {
    //             pg.fill(colors[0]);
    //         } else {
    //             pg.fill(colors[1 + Math.floor(Math.random() * (colors.length - 1))]);
    //         }
    //         webgl_circle(pg, (1 - i / num_layers) * radius, 100)
    //     }
    // },

    // Even sized num_layers with the first one and a random second every other one
    // function pgraphics_segaiha_even_first_color_border_random_otherwise(pg, radius, colors, num_layers, fill_ratios) {

    //     let fill_color = colors[0];
    //     pg.noStroke();
    //     for (let i = 0; i < num_layers; i++) {
    //         if (i > 0) {
    //             let new_color = colors[Math.floor(Math.random() * (colors.length))];
    //             while (new_color == fill_color) {
    //                 new_color = colors[Math.floor(Math.random() * (colors.length))];
    //             }
    //             fill_color = new_color;
    //         }
    //         pg.fill(fill_color);
    //         webgl_circle(pg, (1 - i / num_layers) * radius, 100)
    //     }
    // },

    // Fill ratio layers with the first and second colors alternating
    // function pgraphics_segaiha_fill_ratios_colors_first_second_alternate(pg, radius, colors, num_layers, fill_ratios) {
    //     let cumulative_fill_ratios = cumulative_sum(fill_ratios);
    //     cumulative_fill_ratios.unshift(0)
    //     cumulative_fill_ratios.pop();

    //     pg.noStroke();
    //     for (let i = 0; i < num_layers - 1; i++) {
    //         pg.fill(colors[i % 2]);
    //         webgl_circle(pg, (1 - cumulative_fill_ratios[i]) * radius, 100);
    //     }
    // },


    // Fill ratio layers with the first color stable, alternating are random
    function pgraphics_segaiha_fill_colors_colors_first_second_is_random(pg, radius, colors, num_layers, fill_ratios) {
        const cumulative_fill_ratios = cumulative_sum(fill_ratios);
        cumulative_fill_ratios.unshift(0)
        cumulative_fill_ratios.pop();

        pg.noStroke();
        for (let i = 0; i < num_layers - 1; i++) {
            if (i % 2 == 0) {
                pg.fill(colors[0]);
            } else {
                pg.fill(colors[1 + Math.floor(Math.random() * (colors.length - 1))]);
            }
            webgl_circle(pg, (1 - cumulative_fill_ratios[i]) * radius, 100);
        }
    },

    // Fill ratio layers with the first one and a random second every other one
    // function pgraphics_segaiha_even_first_color_border_random_otherwise(pg, radius, colors, num_layers, fill_ratios) {
    //     const cumulative_fill_ratios = cumulative_sum(fill_ratios);
    //     cumulative_fill_ratios.unshift(0)
    //     cumulative_fill_ratios.pop();

    //     let fill_color = colors[0];
    //     pg.noStroke();
    //     for (let i = 0; i < num_layers - 1; i++) {
    //         if (i > 0) {
    //             let new_color = colors[Math.floor(Math.random() * (colors.length))];
    //             while (new_color == fill_color) {
    //                 new_color = colors[Math.floor(Math.random() * (colors.length))];
    //             }
    //             fill_color = new_color;
    //         }
    //         pg.fill(fill_color);
    //         webgl_circle(pg, (1 - cumulative_fill_ratios[i]) * radius, 100);
    //     }
    // },

];



/* Segaiha draw functions here
 * Using the same input signatures for all in order to make it easier to randomly select them
 * Will probably ignore a lot of them for many functions

 ** Param descriptions:
 ** Required:
 * radius: this is the max radius of the circle
 * colors: an array of p5js colors, assume the first is primary and all other are secondary
 ** Optional:
 * num_layers: for waves with muliple even layers, this defines how many there are
 * fill_ratios: for waves with multiple layers of different thicknesses, this defines how thick each layer will be
 */

const segaiha_draw_funcs = [


    // Solid fill of the first color in colors
    function segaiha_solid_fill(radius, colors, num_layers, fill_ratios) {
        noStroke();
        fill(colors[0]);
        circle(0, 0, radius);
    },

    // Draw small sun in the middle using the first and second colors
    function segaiha_small_sun(radius, colors, num_layers, fill_ratios) {
        noStroke();
        fill(colors[0]);
        circle(0, 0, radius);
        fill(colors[1]);
        circle(0, 0, radius * 0.85);
        fill(colors[0]);
        circle(0, 0, radius * 0.25);

        const num_spokes = 10;

        push();
        rotate(PI * 2 / num_spokes / 2);
        for (let i = 0; i < num_spokes; i++) {
            push();
            translate(0, radius * 0.15);
            triangle(-radius * 0.03, 0, radius * 0.03, 0, 0, radius * 0.2);
            pop();
            rotate(PI * 2 / num_spokes);
        }
        pop();
    },


    // Even sized num_layers in the lerping between first and second colors
    function segaiha_lerp_between_first_second(radius, colors, num_layers, fill_ratios) {
        noStroke();
        for (let i = 0; i < num_layers; i++) {
            fill(lerpColor(colors[0], colors[1], i / (num_layers - 1)));
            circle(0, 0, (1 - i / num_layers) * radius);
        }
    },

    // Even sized num_layers in the first and second colors in
    function segaiha_even_colors_first_second(radius, colors, num_layers, fill_ratios) {
        noStroke();
        for (let i = 0; i < num_layers; i++) {
            fill(colors[i % 2]);
            circle(0, 0, (1 - i / num_layers) * radius);
        }
    },

    // Even sized num_layers with the first one consistently every other
    function segaiha_even_colors_first_second_is_random_constant(radius, colors, num_layers, fill_ratios) {
        let second_color = colors[1 + Math.floor(Math.random() * (colors.length - 1))];
        noStroke();
        for (let i = 0; i < num_layers; i++) {
            if (i % 2 == 0) {
                fill(colors[0]);
            } else {
                fill(second_color);
            }
            circle(0, 0, (1 - i / num_layers) * radius);
        }
    },


    // Even sized num_layers with the first one and a random second every other one
    function segaiha_even_colors_first_second_is_random(radius, colors, num_layers, fill_ratios) {

        noStroke();
        for (let i = 0; i < num_layers; i++) {
            if (i % 2 == 0) {
                fill(colors[0]);
            } else {
                fill(colors[1 + Math.floor(Math.random() * (colors.length - 1))]);
            }
            circle(0, 0, (1 - i / num_layers) * radius);
        }
    },

    // Even sized num_layers with the first one and a random second every other one
    function segaiha_even_first_color_border_random_otherwise(radius, colors, num_layers, fill_ratios) {

        let fill_color = colors[0];
        noStroke();
        for (let i = 0; i < num_layers; i++) {
            if (i > 0) {
                let new_color = colors[Math.floor(Math.random() * (colors.length))];
                while (new_color == fill_color) {
                    new_color = colors[Math.floor(Math.random() * (colors.length))];
                }
                fill_color = new_color;
            }
            fill(fill_color);
            circle(0, 0, (1 - i / num_layers) * radius);
        }
    },

    // Fill ratio layers with the first and second colors alternating
    function segaiha_rill_ratios_colors_first_second_alternate(radius, colors, num_layers, fill_ratios) {
        let cumulative_fill_ratios = cumulative_sum(fill_ratios);
        cumulative_fill_ratios.unshift(0)
        cumulative_fill_ratios.pop();

        noStroke();
        for (let i = 0; i < num_layers - 1; i++) {
            fill(colors[i % 2]);
            circle(0, 0, (1 - cumulative_fill_ratios[i]) * radius);
        }
    },


    // Fill ratio layers with the first color stable, alternating are random
    function segaiha_fill_colors_colors_first_second_is_random(radius, colors, num_layers, fill_ratios) {
        const cumulative_fill_ratios = cumulative_sum(fill_ratios);
        cumulative_fill_ratios.unshift(0)
        cumulative_fill_ratios.pop();

        noStroke();
        for (let i = 0; i < num_layers - 1; i++) {
            if (i % 2 == 0) {
                fill(colors[0]);
            } else {
                fill(colors[1 + Math.floor(Math.random() * (colors.length - 1))]);
            }
            circle(0, 0, (1 - cumulative_fill_ratios[i]) * radius);
        }
    },

    // Fill ratio layers with the first one and a random second every other one
    function segaiha_even_first_color_border_random_otherwise(radius, colors, num_layers, fill_ratios) {
        const cumulative_fill_ratios = cumulative_sum(fill_ratios);
        cumulative_fill_ratios.unshift(0)
        cumulative_fill_ratios.pop();

        let fill_color = colors[0];
        noStroke();
        for (let i = 0; i < num_layers - 1; i++) {
            if (i > 0) {
                let new_color = colors[Math.floor(Math.random() * (colors.length))];
                while (new_color == fill_color) {
                    new_color = colors[Math.floor(Math.random() * (colors.length))];
                }
                fill_color = new_color;
            }
            fill(fill_color);
            circle(0, 0, (1 - cumulative_fill_ratios[i]) * radius);
        }
    },

];


const predefined_fill_ratios = [
    // Two thing first lines outside and middle and filled middle
    [
        0.1,
        0.25,
        0.1,
        0.25,
        0.2
    ],
    // Two thin outside lines
    [
        0.1,
        0.1,
        0.1,
        0.7
    ],
    //Bold outside and many thin firsts inside
    [
        0.10,
        0.15,
        0.05,
        0.15,
        0.05,
        0.15,
        0.05,
        0.05
    ]
];
