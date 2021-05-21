//

class Jump extends React.Component {
	updateFn() {
		this.setState({
			numerator: window.scrollY,
			denominator: document.body.scrollHeight - window.innerHeight
		});
	}
	
	constructor(props) {
		super(props);
		this.state = {};
		this.updateFn = this.updateFn.bind(this);
		window.addEventListener("scroll", this.updateFn);
	}
	
	componentDidMount() {
		this.updateFn();
	}
	
	componentWillUnmount() {
		window.removeEventListener("scroll", this.updateFn);
	}
	
	render() {
		let frac = (this.state.numerator / this.state.denominator * 100);
		frac = frac.toFixed(1);
		if (frac < 0)
			frac = 0;
		if (frac > 100)
			frac = 100;
		return (
			<div>
			{frac}% scrolled
			</div>
		);
	}
}

(function() {
	const sb = document.createElement("sidebar");
	sb.style = "";
	document.body.appendChild(sb);
	ReactDOM.render(<Jump />, sb);
})();
