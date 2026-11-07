# data

| ファイル | 内容 | 出典 |
|---|---|---|
| pokemon.json | ポケモンの図鑑番号・英語名・経験値タイプ・タイプ | [nitoyon/pokesleep-tool](https://github.com/nitoyon/pokesleep-tool) の pokemon.json |
| exp.json | 経験値タイプ別・レベル別の必要EXP | [wiki 育成/経験値タイプ](https://wikiwiki.jp/poke_sleep/育成/経験値タイプ) の表 |
| dreamShards.json | レベル別のアメ1個あたりのゆめのかけら | [wiki 育成/レベル](https://wikiwiki.jp/poke_sleep/育成/レベル) の必要EXP表 |

## 実機データによる修正

- exp.json 900タイプ Lv63: wiki の 4,466 ではなく 4,465。バンギラス Lv60(次まで 1,866)にアメ 358 個 → Lv62 次まで 1,764 という実機の記録から確定(2回確認)。

検証に使った実機データは src/util/levelUp.test.ts にテストとして残している。
