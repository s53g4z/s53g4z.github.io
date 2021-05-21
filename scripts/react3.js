//

class Jump extends React.Component {
	updateFn() {
		this.setState({
			numerator: window.scrollY,
			denominator: window.scrollMaxY
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
		return (
			<div>
			{(this.state.numerator /
				this.state.denominator *
				100).toPrecision(3)
			}% scrolled
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
