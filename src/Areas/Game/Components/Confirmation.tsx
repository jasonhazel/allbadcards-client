import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Container} from "@material-ui/core";

const useStyles = makeStyles({
	container: {
		position: "fixed",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		bottom: 0,
		left: 0,
		width: "100%",
		zIndex: 99
	},
	inner: {
		boxSizing:"border-box",
		display: "flex",
		width: "100%",
		background: "white",
		justifyContent: "center",
		padding: "1rem 0",
		boxShadow: "0 -15px 10px -15px rgba(0,0,0,1)"
	}
});

export const Confirmation: React.FC = (props) =>
{
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<Container maxWidth={"md"} style={{padding :0}}>
				<div className={classes.inner}>
					{props.children}
				</div>
			</Container>
		</div>
	);
}