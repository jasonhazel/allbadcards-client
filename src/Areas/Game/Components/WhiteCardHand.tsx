import Grid from "@material-ui/core/Grid";
import {WhiteCard} from "../../../UI/WhiteCard";
import Button from "@material-ui/core/Button";
import * as React from "react";
import {IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData} from "../../../Global/DataStore/UserDataStore";
import {useState} from "react";
import sanitize from "sanitize-html";

interface Props
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	targetPicked: number;
	onPickUpdate: (cards: number[]) => void;
}

export const WhiteCardHand: React.FC<Props> =
	({
		 userData,
		 gameData,
		 targetPicked,
		 onPickUpdate
	 }) =>
	{
		const [pickedCards, setPickedCards] = useState<number[]>([]);

		const onPick = (id: number) =>
		{
			const newVal = [...pickedCards, id];
			setPickedCards(newVal);
			onPickUpdate(newVal);
		};

		const onUnpick = (id: number) =>
		{
			const newVal = pickedCards.filter(a => a !== id);
			setPickedCards(newVal);
			onPickUpdate(newVal);
		};

		if (!gameData.game)
		{
			return null;
		}

		const {
			players,
			roundCards,
		} = gameData.game;

		const me = players[userData.playerGuid];

		if (!me)
		{
			return null;
		}

		const playerCardIds = Object.keys(gameData.playerCardDefs).map(id => parseInt(id));

		const hasPlayed = userData.playerGuid in roundCards;

		const renderedCardIds = hasPlayed
			? []
			: playerCardIds;

		const renderedDefs = hasPlayed ? gameData.roundCardDefs : gameData.playerCardDefs;

		const metPickTarget = targetPicked <= pickedCards.length;

		const renderedHand = renderedCardIds.map((cardId, i) =>
		{
			const pickedIndex = pickedCards.indexOf(cardId);
			const picked = pickedIndex > -1;
			const label = picked
				? targetPicked > 1
					? `Picked: ${pickedIndex + 1}`
					: "Picked"
				: "Pick";

			return (
				<Grid item xs={12} sm={6} md={4}>
					{cardId && (
						<WhiteCard
							key={cardId}
							actions={!hasPlayed && (
								<>
									<Button
										variant={"contained"}
										color={"primary"}
										disabled={metPickTarget || pickedCards.includes(cardId)}
										onClick={() => onPick(cardId)}
									>
										{label}
									</Button>
									<Button
										variant={"contained"}
										color={"primary"}
										disabled={!pickedCards.includes(cardId)}
										onClick={() => onUnpick(cardId)}
									>
										Unpick
									</Button>
								</>
							)}
						>
							<div dangerouslySetInnerHTML={{__html: sanitize(renderedDefs[cardId] ?? "")}} />
						</WhiteCard>
					)}
				</Grid>
			);
		});

		return <>
			{renderedHand}
		</>;
	};