import * as React from "react";
import {CircularProgress} from "@material-ui/core";

interface IContainerProgressProps
{
}

interface DefaultProps
{
}

type Props = IContainerProgressProps & DefaultProps;
type State = IContainerProgressState;

interface IContainerProgressState
{
}

export class ContainerProgress extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
		};
	}

	public componentDidMount(): void
	{
	}

	public render()
	{
		return (
			<div style={{
				position: "fixed",
				zIndex: 99,
				top: 0,
				left: 0,
				right: 0,
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				pointerEvents: "none"
			}}>
				<CircularProgress/>
			</div>
		);
	}
}