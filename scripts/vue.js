//

function vue() {
	const app = Vue.createApp({});
	const comp = {
		data() {
			return {
				clicks: 0,
				startTime: 0,
				cps: 0,
				running: false
			}
		},
		methods: {
			currTimeInSeconds() {
				return new Date().valueOf() / 1000;
			},
			reset() {  // based on heuristic only
				this.clicks = 0;
				this.startTime = this.currTimeInSeconds();
				setTimeout(this.reset, 4000 + Math.random() * 2000);
			},
			click() {
				if (!this.running) {
					this.running = true;
					setInterval(() => {
						const now = this.currTimeInSeconds();
						if (this.startTime === 0) {
							this.startTime = now;
							return;
						} else if (now - this.startTime !== 0) {
							this.cps = this.clicks / (now - this.startTime);
							this.cps = this.cps.toPrecision(3);
						}
					}, 50);
					setTimeout(this.reset, 4000);
				}
				this.clicks++;
			}
		},
		template: `
			<div class="target" v-on:click="click">
				<div class="cps">
					{{cps}} clicks per second.
				</div>
			</div>
		`,
		mounted: function() {
		}
	};
	app.component("counter", comp);
	app.mount("#the_div");
}

// main?
(() => {
	document.body.innerHTML = "<div id=\"the_div\"><counter></counter></div>";
	if (window.innerHeight > window.innerWidth)
		document.getElementById("the_div").appendChild(
			document.createElement("counter")
		);
	vue();
})();
