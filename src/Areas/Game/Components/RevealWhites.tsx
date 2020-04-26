import * as React from "react";
import Grid from "@material-ui/core/Grid";
import {WhiteCard} from "../../../UI/WhiteCard";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";
import sanitize from "sanitize-html";
import {LoadingButton} from "../../../UI/LoadingButton";

interface IRevealWhitesProps
{
	canReveal: boolean;
}

interface DefaultProps
{
}

type Props = IRevealWhitesProps & DefaultProps;
type State = IRevealWhitesState;

interface IRevealWhitesState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	revealLoading: boolean;
}

export class RevealWhites extends React.Component <Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			revealLoading: false
		};
	}

	public componentDidMount(): void
	{
		GameDataStore.listen(data => this.setState({
			gameData: data
		}));

		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	private onReveal = () =>
	{
		this.setState({
			revealLoading: true
		});

		GameDataStore.revealNext(this.state.userData.playerGuid)
			.finally(() => this.setState({
				revealLoading: false
			}));
	};

	public render()
	{
		const {
			gameData,
			revealLoading
		} = this.state;
		
		if(!gameData.game)
		{
			return null;
		}

		const game = gameData.game;
		const playerOrder = game.playerOrder ?? Object.keys(game.players);
		const roundPlayerOrder = playerOrder.filter(a => a !== game.chooserGuid);
		const roundCardKeys = Object.keys(game.roundCards ?? {});
		const roundPlayers = Object.keys(game.roundCards ?? {});
		const remainingPlayerGuids = Object.keys(game.players ?? {})
			.filter(pg => !(pg in (game.roundCards ?? {})) && pg !== game.chooserGuid);
		const remainingPlayers = remainingPlayerGuids.map(pg => game.players?.[pg]?.nickname);
		const realRevealIndex = game.revealIndex ?? -1;
		const revealedIndex = realRevealIndex % roundPlayers.length;
		const playerGuidAtIndex = roundPlayerOrder[isNaN(revealedIndex) ? 0 : revealedIndex];
		const cardsIdsRevealed = game.roundCards[playerGuidAtIndex] ?? [];
		const cardsRevealed = cardsIdsRevealed.map(cid => gameData.roundCardDefs[cid]);
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && realRevealIndex < roundCardKeys.length;

		if (!revealMode)
		{
			return null;
		}

		const lastCard = realRevealIndex === roundCardKeys.length - 1;
		const label = lastCard ? "Pick a winner" : "Next";

		return (
			<Grid item xs={12} sm={6}>
				{realRevealIndex >= 0 && (
					<>
						<WhiteCard key={revealedIndex} style={{marginBottom: "0.5rem"}}>
							{cardsRevealed.map(card => card && (
								<>
									<div dangerouslySetInnerHTML={{__html: sanitize(card)}} />
									<Divider style={{margin: "1rem 0"}}/>
								</>
							))}
							{this.props.canReveal && (
								<LoadingButton loading={revealLoading} color={"primary"} variant={"contained"} onClick={this.onReveal}>
									{label}
								</LoadingButton>
							)}
						</WhiteCard>
					</>
				)}
				{realRevealIndex === -1 && this.props.canReveal && (
					<LoadingButton loading={revealLoading} color={"primary"} variant={"contained"} onClick={this.onReveal}>
						Show me the cards!
					</LoadingButton>
				)}
			</Grid>
		);
	}
}