import * as React from "react";
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {ReactNode} from "react";
import sanitize from "sanitize-html";

interface IBlackCardProps
{
	children?: string;
}

interface DefaultProps
{
}

type Props = IBlackCardProps & DefaultProps;
type State = IBlackCardState;

interface IBlackCardState
{
	elevation: number;
}

export class BlackCard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			elevation: 2
		};
	}

	private onMouseEnter = () =>
	{
		this.setState({
			elevation: 10
		});
	};

	private onMouseLeave = () =>
	{
		this.setState({
			elevation: 2
		});
	};

	public render()
	{
		const children = this.props.children?.replace(/_/g, "_________") ?? "";
		const sanitized = sanitize(children);

		return (
			<Card
				style={{
					minHeight: "25vh",
					cursor: "default",
					backgroundColor: "black",
				}}
				elevation={this.state.elevation}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<CardContent>
					<Typography variant={"h6"} style={{color: "white"}}>
						<span dangerouslySetInnerHTML={{__html: sanitized}} />
					</Typography>
				</CardContent>
			</Card>
		);
	}
}