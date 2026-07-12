export interface StoryChapter {
  chapter: number; // 1〜5
  title: string;
  body: string[]; // 段落ごとの本文
}

export interface DialogueLine {
  speakerId: string; // characters.ts のキャラクターID
  line: string;
}

// 各キャラクターの第3章（壁にぶつかる章）に登場するライバルとの会話劇。
// 会話の後に「その相手とストーリー対戦する」ボタンが表示され、
// 章の主人公を操作してライバルと単発対戦できる。
export interface ChapterEncounter {
  rivalId: string;
  lines: DialogueLine[];
}

// 全キャラクター共通で「1:日常 → 2:きっかけ → 3:壁 → 4:覚醒 → 5:現在」の5章構成。
// 罵倒デッキ構築ゲームという世界観の中での短編ストーリーで、ゲームバランスには影響しない。
export const STORIES: Record<string, StoryChapter[]> = {
  romako: [
    {
      chapter: 1,
      title: "罵倒の女王、降臨",
      body: [
        "罵尻ロマ子は今日も配信部屋の椅子に足を組んで座り、開口一番「今日もムズムズして落ち着いてられないのらわ!!」と言った。",
        "変なことしか言わない。ただし言い方は選ばない。それがロマ子様のスタイルなのら",
      ],
    },
    {
      chapter: 2,
      title: "退屈な日々への宣戦布告",
      body: [
        "「罵倒デッキ構築大会」の噂を聞いたとき、ロマ子は鼻で笑った。",
        "「相手を言葉で叩きのめすゲーム？ロマ子様の得意分野なのだわ。ぜってーぶちのめしてやんのらわ!!」。エントリー用紙にサインするその手つきは、すでに女王のあれだった。",
      ],
    },
    {
      chapter: 3,
      title: "正論には正論を",
      body: [
        "初戦、相手はロマ子の発言の矛盾を一つひとつ数え上げてきた。",
        "「いらんことほざいてんじゃねー。ぶちのめしてやんわ！！」。的確な正論が、初めてロマ子の誇りを大きく削った。",
        "苛立ちながらも、ロマ子は気づく——正論には、もっと強い正論で返すしかない。",
      ],
    },
    {
      chapter: 4,
      title: "女王様の罵倒",
      body: [
        "怒りが頂点に達した瞬間、ロマ子の口から出たのは怒鳴り声ではなく、一言だった。",
        "「刃jファjklfjwジェジョエじゃおfソアじょえいなのら！！へーんだ！！」。",
        "ただただ落ち着きがなく、反論の余地がない。まさかの子のタイミングで「女王様の罵倒」が完成した瞬間だった。",
      ],
    },
    {
      chapter: 5,
      title: "玉座からの挑戦状",
      body: [
        "今やロマ子は大会の常連であり、誰もが認める女王格。",
        "「オメェが次の挑戦者か？オメェのことなんか屁でもねーぞ！？へーんだ！！」",
      ],
    },
  ],

  bg: [
    {
      chapter: 1,
      title: "BGの一日",
      body: [
        "BGは誰かに何を言われても、大抵３秒後には忘れている。",
        "悪気はない。ただ、他人の感情の機微を読み取るセンサーが、生まれつき鈍いだけだ。",
        "そう、ただの怠け者マゾ豚である。"
      ],
    },
    {
      chapter: 2,
      title: "気づいたらエントリーしていた",
      body: [
        "「罵倒デッキ構築大会、出てみないブヒか？」としんごトンに誘われたBGは「ブヒー！ありがとうございます〜❤️」と頭が急におかしくなるように答えた。",
        "ルールをちゃんと理解していたかは、正直あやしい。",
        "なぜかって？ただの怠け者マゾ豚だからだよ"
      ],
    },
    {
      chapter: 3,
      title: "刺さらない、はずだった",
      body: [
        "自虐ネタで攻められても、BGはきょとんとするだけで誇りが揺らがない。",
        "だが、ある対戦で「自分を落とすふりをして、実は本気で凹んでいる」相手の一言が、なぜか深く刺さった。",
        "鈍感なはずの自分にも、効く言葉があるらしい。BGは初めてそれを知った。",
      ],
    },
    {
      chapter: 4,
      title: "BGの正論爆撃",
      body: [
        "感情で揺さぶられないBGが得意なのは、ゲームをすること。",
        "「気づいたらゲームに100万円使ってしまったぶひ...。そんなこと忘れて自分を正当化するぶひ」。",
        "相手の防御をすべて崩す正論の連射——「BGの正論爆撃」が生まれた。",
      ],
    },
    {
      chapter: 5,
      title: "淡々と、確実に",
      body: [
        "BGは今日も表情を変えずに対戦相手を選ぶ。",
        "「そんなことやっても無駄ぶひ！！」——最近覚えたその一言だけは、妙に堂に入っている。",
      ],
    },
  ],

  shingo: [
    {
      chapter: 1,
      title: "しんごの短気",
      body: [
        "しんごの怒りの沸点は低い。信号が赤に変わっただけでもため息が出る。",
        "「ああ、なんでまた赤信号ぶひか！！！」",
        "だが、言いたいことを我慢するタイプでもない。溜め込まない性格が、逆に彼を守っていた。",
      ],
    },
    {
      chapter: 2,
      title: "スッキリしたくて",
      body: [
        "「言いたいことを言えるゲームがある」とうえむトンから聞いて、しんごは即座に飛びついた。",
        "普段我慢していることを、正々堂々ぶつけられる場所。それだけで参加する理由は十分だった。",
      ],
    },
    {
      chapter: 3,
      title: "煽られると弱い",
      body: [
        "皮肉なことに、しんご自身は「煽り」に極端に弱かった。",
        "軽く挑発されただけで我を忘れ、雑な一手を打ってしまう。何度も同じパターンで負けた。",
      ],
    },
    {
      chapter: 4,
      title: "しんごのスッキリタイム",
      body: [
        "ある日、しんごは気づく。「言いたいことを言った後の自分」の方が、実は強いということに。",
        "怒りに任せるのではなく、言い切ってから冷静になる。「言いたいことを言うと、スッキリするぶひ」——攻撃と回復を兼ねた必殺カードが生まれた。",
      ],
    },
    {
      chapter: 5,
      title: "今日も真っ直ぐに",
      body: [
        "しんごの戦い方は今も変わらない。まっすぐで、正直で、少し短気。",
        "「ロマ子さまのこと想像すると、スッキリするぶひ！！」——本人いわく、それが一番効くらしい。",
      ],
    },
  ],

  hisa: [
    {
      chapter: 1,
      title: "静かなHisa",
      body: [
        "Hisaはあまり多くを語らない。だが、その沈黙には常に何かが込められている。",
        "コミュニティの中でも「Hisaが黙っている時は要注意」と言われていた。",
      ],
    },
    {
      chapter: 2,
      title: "言葉より、間で語る",
      body: [
        "大会の噂を聞いたHisaは、何も言わずにエントリーシートを提出した。",
        "「参加するの？」と聞かれても、頷くだけ。それがHisaなりの返事だった。",
      ],
    },
    {
      chapter: 3,
      title: "皮肉という刃",
      body: [
        "遠回しな皮肉を連発してくる相手に、Hisaの誇りは静かに、しかし確実に削られていった。",
        "言い返そうとして、言葉が出てこない。「静かさ」は時に弱点にもなる。",
      ],
    },
    {
      chapter: 4,
      title: "Hisaの静かな圧",
      body: [
        "追い詰められたHisaが選んだのは、大声ではなく、さらに深い静けさだった。",
        "「静かなほど、怖い」。何も語らずただ相手を見据えるその圧は、皮肉よりも強く場を支配した。",
      ],
    },
    {
      chapter: 5,
      title: "変わらない佇まい",
      body: [
        "Hisaは今日も静かに対戦相手の前に座る。",
        "何を考えているかは、誰にも分からない。分かるのは、対戦が終わる頃には結果が出ているということだけ。",
      ],
    },
  ],

  take: [
    {
      chapter: 1,
      title: "たけちゃんの瞬発力",
      body: [
        "たけちゃんは考えるより先に口が動くタイプだ。",
        "後で「また変なこと言っちゃったよ」と反省することも多いが、その正直さがコミュニティでは愛されていた。",
      ],
    },
    {
      chapter: 2,
      title: "勢いでエントリー",
      body: [
        "大会のことを知った次の瞬間には、もうエントリーボタンを押していた。",
        "よく考えていなかったことに気づいたのは、対戦相手が決まってからだった。",
      ],
    },
    {
      chapter: 3,
      title: "煽られると止まらない",
      body: [
        "短気なたけちゃんは、煽り耐性がとにかく低い。",
        "挑発を受けるとムキになって畳みかけ、隙だらけの猛攻を仕掛けては返り討ちに遭う——その繰り返しだった。",
      ],
    },
    {
      chapter: 4,
      title: "たけちゃん瞬発ラッシュ",
      body: [
        "だが、その「考えるより先に出る」性質こそが、実は最大の武器でもあった。",
        "「考えるより先に、口が出た」。相手の反応速度を超える連続攻撃——瞬発ラッシュが完成した。",
      ],
    },
    {
      chapter: 5,
      title: "今日も全力で",
      body: [
        "たけちゃんの戦い方は今も変わらない。全力で、正直で、少しだけ後先を考えない。",
        "「あぁ、ロマ子様。2人のデート楽しみに待っててね」",
        "それでも、勝率は着実に上がっている。",
      ],
    },
  ],

  teruzo: [
    {
      chapter: 1,
      title: "てるぞーの照れ隠し",
      body: [
        "てるぞーは褒められるのが何よりも苦手だ。褒められると、なぜか怒ったような顔をする。",
        "コミュニティでは「てるぞーの照れ隠し」として親しまれている、ちょっとした名物だった。",
      ],
    },
    {
      chapter: 2,
      title: "誘われて、渋々",
      body: [
        "「大会出ましょうよ」とたけちゃんに誘われたてるぞーは「別に、出たくて出るわけじゃないしなぁ」と言いながら参加登録をしていた。",
        "この時点で、行動と言葉が一致していないことに、本人はまだ気づいていない。",
      ],
    },
    {
      chapter: 3,
      title: "皮肉で心が折れかける",
      body: [
        "遠回しに褒めているようで実は貶している——そんな皮肉の刃に、てるぞーは何度も心を折られかけた。",
        "褒め言葉なのか嫌味なのか判断できず、混乱したまま誇りを削られていく。",
      ],
    },
    {
      chapter: 4,
      title: "てるぞーの照れ隠し",
      body: [
        "追い詰められたてるぞーがひねり出したのは、開き直りだった。",
        "「べ、別に効いてないし」と言いながら、実は誇りをしっかり回復させている——照れ隠しがそのまま必殺技になった。",
      ],
    },
    {
      chapter: 5,
      title: "素直じゃないままで",
      body: [
        "今も勝った後は「別に嬉しくないし」と言いながら、口元がゆるんでいる。",
        "その不器用さごと、てるぞーは強い。",
      ],
    },
  ],

  rion: [
    {
      chapter: 1,
      title: "りおんの観察眼",
      body: [
        "りおんは口数こそ多くないが、周りをよく見ている。",
        "誰が何に傷つき、誰が何を強がっているか——そういうことに、人一倍敏感だった。",
      ],
    },
    {
      chapter: 2,
      title: "作る側から、戦う側へ",
      body: [
        "もともとはこの罵倒デッキ構築ゲーム自体を作っていた側の人間だった、という噂もある。",
        "「せっかく作ったんだから、自分でも戦ってみよう」——そんな軽い気持ちで最初の一戦に臨んだ。",
      ],
    },
    {
      chapter: 3,
      title: "繊細さゆえの脆さ",
      body: [
        "皮肉を交えた鋭い一言に、りおんの誇りは思いのほか大きく削られた。",
        "「見透かされている」という感覚が、何よりもこたえる。誇りが半分を切ったとき、りおんは膝をつきかけた。",
      ],
    },
    {
      chapter: 4,
      title: "りおんの起死回生",
      body: [
        "だが、追い詰められてからが本番だった。",
        "「追い込まれてからが、本番」。瀕死の状態から放つ一撃は、平時よりもずっと重い一撃になった。",
      ],
    },
    {
      chapter: 5,
      title: "作り手として、挑戦者として",
      body: [
        "今もりおんは大会の運営を手伝いながら、自分自身もプレイヤーとして参加し続けている。",
        "「このゲーム、まだまだ面白くできると思うんだよね」——それが、りおんの一番の口癖だ。",
      ],
    },
  ],

  baku: [
    {
      chapter: 1,
      title: "バクの夢見がち",
      body: [
        "バクはいつもどこかぼんやりしていて、話しかけても反応が一拍遅れる。",
        "「今、何か言った？」が口癖で、周りからは半ば呆れられ、半ば愛されていた。",
      ],
    },
    {
      chapter: 2,
      title: "気づいたら対戦表に名前が",
      body: [
        "エントリーした記憶は、実はあまりない。",
        "気がついたら対戦表に自分の名前が載っていて、「まあ、いいか」と受け入れた。",
      ],
    },
    {
      chapter: 3,
      title: "自虐からの逆転が効く",
      body: [
        "鈍感なバクにも、なぜか「自分を落としてからの反撃」だけはよく刺さった。",
        "油断していたところを不意打ちされ、何度も誇りを大きく持っていかれた。",
      ],
    },
    {
      chapter: 4,
      title: "バクの夢喰い",
      body: [
        "ぼんやりしているようで、実はバクは相手の「次の一手」を先読みするのが得意だった。",
        "「君の次の一手、もう食べちゃった」。相手の行動を先取りして無力化する——夢喰いの必殺が生まれた瞬間だった。",
      ],
    },
    {
      chapter: 5,
      title: "今日もどこかぼんやりと",
      body: [
        "バクは今もどこかぼんやりしたまま、対戦相手の前に座っている。",
        "だが、対戦が始まった瞬間だけは、その目がわずかに鋭くなる。",
      ],
    },
  ],

  sachiyo: [
    {
      chapter: 1,
      title: "さちよの包容力",
      body: [
        "さちよはコミュニティの中で「みんなのお母さん」的な存在だった。",
        "誰が失敗しても「はいはい、みんなえらいえらい」と受け止めてくれる。",
      ],
    },
    {
      chapter: 2,
      title: "みんなのために出場",
      body: [
        "「大会、誰も出てくれないなら私が出るしかないか」——そんな消極的な理由で、さちよはエントリーした。",
        "本人はあまり乗り気ではなかった。",
      ],
    },
    {
      chapter: 3,
      title: "優しさが仇になる",
      body: [
        "皮肉を交えた鋭い言葉に、優しいさちよは人一倍傷ついた。",
        "「そんな言い方しなくても……」と思いながらも、うまく言い返せない自分がもどかしかった。",
      ],
    },
    {
      chapter: 4,
      title: "さちよの包容力",
      body: [
        "だが、さちよの本領は攻撃ではなく回復にあった。",
        "「はいはい、みんなえらいえらい」——自分自身にもその言葉をかけられるようになったとき、誇りは大きく回復するようになった。",
      ],
    },
    {
      chapter: 5,
      title: "今日も誰かを支えながら",
      body: [
        "さちよは今も大会の合間に、負けて落ち込む誰かの話を聞いている。",
        "そういう人だからこそ、対戦相手として向き合うと、その芯の強さに驚かされる。",
      ],
    },
  ],

  uemu: [
    {
      chapter: 1,
      title: "うえむの理詰め",
      body: [
        "うえむは何を話すにも筋道を立てないと気が済まない。",
        "「それってどういう論理？」が口癖で、雑談すら議論になりがちだった。",
      ],
    },
    {
      chapter: 2,
      title: "理論武装してのエントリー",
      body: [
        "大会のルールを隅々まで読み込み、想定される展開をノートにまとめてからエントリーした。",
        "その用意周到さは、コミュニティでも一目置かれていた。",
      ],
    },
    {
      chapter: 3,
      title: "正論には正論しか勝てない",
      body: [
        "自分より鋭い正論を返されると、うえむのプライドは大きく傷ついた。",
        "「反論できない」という状態が、うえむにとっては何よりの敗北感だった。",
      ],
    },
    {
      chapter: 4,
      title: "うえむの理詰め",
      body: [
        "負けを重ねる中で、うえむは「感情ではなく、条件で殴る」戦い方に行き着いた。",
        "「反論は認める。ただし論理的なものに限る」。相手の手札まで見透かした上での理詰めの一撃が完成した。",
      ],
    },
    {
      chapter: 5,
      title: "今も筋を通して",
      body: [
        "うえむは今も対戦前に相手のデッキ傾向を分析している。",
        "「感情で来られても困るんだよね」とぼやきながら、実は誰よりも対戦を楽しんでいる。",
      ],
    },
  ],

  mito: [
    {
      chapter: 1,
      title: "みとの辛口",
      body: [
        "みとは何を見ても点数をつけたがる。映画も、料理も、他人の罵倒カードの選び方も。",
        "「まあ、うん、悪くはない」が最大級の褒め言葉だった。",
      ],
    },
    {
      chapter: 2,
      title: "採点する側から、される側へ",
      body: [
        "「じゃあ自分がやったらどうなの」と挑発され、大会にエントリーすることになった。",
        "審査員気分が抜けないまま、初戦に臨んだ。",
      ],
    },
    {
      chapter: 3,
      title: "鈍感さの落とし穴",
      body: [
        "他人の評価には鈍感なはずのみとだったが、「自分を落としてからの逆転」にだけは弱かった。",
        "油断したところを突かれ、何度も痛い目を見た。",
      ],
    },
    {
      chapter: 4,
      title: "みとの辛口批評",
      body: [
        "だが、みとの本領はやはり「評価すること」にあった。",
        "「点数で言うと、まあ、うん」——相手の一手を的確に評価しながら突き刺す辛口批評が、必殺カードとして結実した。",
      ],
    },
    {
      chapter: 5,
      title: "今日も採点は厳しめ",
      body: [
        "みとは今も対戦相手の一手一手に、心の中でこっそり点数をつけている。",
        "「今の一手は7点くらいかな」——それでも対戦後は、ちゃんと相手を労っている。",
      ],
    },
  ],

  picco: [
    {
      chapter: 1,
      title: "ピッコーの素早さ",
      body: [
        "ピッコーは何をするにも早い。話すのも早いし、飽きるのも早い。",
        "「今のうちに言うだけ言っとこ！」が口癖で、いつも先手を狙っていた。",
      ],
    },
    {
      chapter: 2,
      title: "様子見なんてしない",
      body: [
        "大会の告知が出た瞬間、真っ先にエントリーしたのがピッコーだった。",
        "「一番乗りって気持ちいいじゃん」——その身軽さが、そのまま戦い方にも表れていた。",
      ],
    },
    {
      chapter: 3,
      title: "煽られると突っ込みすぎる",
      body: [
        "短気なピッコーは、挑発されるとつい前のめりになりすぎる。",
        "勢いはあるが隙も大きい——そのバランスの悪さで、何度も逆転を許してきた。",
      ],
    },
    {
      chapter: 4,
      title: "ピッコーの奇襲",
      body: [
        "それでもピッコーは、その「早さ」を捨てなかった。むしろ研ぎ澄ました。",
        "「今のうちに言うだけ言っとこ！」——コストを軽くしながら一気に畳みかける奇襲の型が完成した。",
      ],
    },
    {
      chapter: 5,
      title: "今日も一番乗りで",
      body: [
        "ピッコーは今日も誰よりも早く対戦相手を探して回っている。",
        "「次、やろ！次！」——そのフットワークの軽さこそが、ピッコーの武器であり魅力だった。",
      ],
    },
  ],

  garyu: [
    {
      chapter: 1,
      title: "臥龍の沈黙",
      body: [
        "臥龍はめったに口を開かない。だが、その目はいつも全てを見透かしているようだった。",
        "コミュニティでは古参として一目置かれる存在だった。",
      ],
    },
    {
      chapter: 2,
      title: "満を持しての参戦",
      body: [
        "大会が始まってしばらく、臥龍は静観していた。",
        "「機は熟した」——そう言って、ようやく重い腰を上げてエントリーしたのは、大会も中盤に差し掛かった頃だった。",
      ],
    },
    {
      chapter: 3,
      title: "プライドを正論で崩される",
      body: [
        "古参としてのプライドを、若手の鋭い正論に打ち砕かれる展開が続いた。",
        "「時代は変わったのか」——初めての本格的な壁に、臥龍は静かに動揺していた。",
      ],
    },
    {
      chapter: 4,
      title: "臥龍の眼光",
      body: [
        "だが、臥龍が本当に強いのはここからだった。",
        "「目は口ほどに物を言う。むしろ言い過ぎる」——言葉を発さずとも相手を萎縮させる眼光が、最大の武器として開花した。",
      ],
    },
    {
      chapter: 5,
      title: "今もなお、古参として",
      body: [
        "臥龍は今も多くを語らない。",
        "だが、対戦表に「臥龍」の名を見つけた新人は、誰もが少しだけ姿勢を正す。",
      ],
    },
  ],
};

export function getStoryChapters(characterId: string): StoryChapter[] {
  return STORIES[characterId] ?? [];
}

// キャラクターID → 章番号 → その章の遭遇（会話＋対戦相手）。全5章に会話と対戦がある。
export const CHAPTER_ENCOUNTERS: Record<string, Record<number, ChapterEncounter>> = {
  romako: {
    1: {
      rivalId: "shingo",
      lines: [
        { speakerId: "shingo", line: "ロマ子様、今日も配信見てるぶひ！罵倒が冴えてるぶひ！" },
        { speakerId: "romako", line: "当然なのらわ。アンタたちマゾ豚のために言ってやってるのよ。へーんだ！" },
        { speakerId: "shingo", line: "ご褒美ぶひぃ！！……あれ、僕いま罵倒されたぶひ？" },
      ],
    },
    2: {
      rivalId: "take",
      lines: [
        { speakerId: "take", line: "ロマ子様も大会出るの！？じゃあ俺、決勝でロマ子様とのデートを賭けて戦うよ！" },
        { speakerId: "romako", line: "誰がデートなんかするのらわ！！身の程を知りなさい！" },
        { speakerId: "take", line: "照れてる照れてる〜。決勝で待ってるからね！" },
      ],
    },
    3: {
      rivalId: "rion",
      lines: [
        { speakerId: "rion", line: "みなさん、こんばんわ。24時間変態発言してるやつ、大体ロマ子。" },
        { speakerId: "romako", line: "オメェ、ほんといつまでやってんだよ。変なことほざいていねーで働けよな" },
        { speakerId: "rion", line: "あ、そういえばあの件について1億円払ってくださいね。もちろんロマ子のお金で" },
        { speakerId: "romako", line: "ロマ子様だかんな！！ロマ子様の罵倒でぶち落としてやんわ！！" },
      ],
    },
    4: {
      rivalId: "garyu",
      lines: [
        { speakerId: "garyu", line: "……今の一言で、場の空気が変わったな。" },
        { speakerId: "romako", line: "当然なのら。女王の本気、見せてあげただけなのらわ。" },
        { speakerId: "garyu", line: "面白い。その覚醒とやら、この眼で確かめさせてもらおう。" },
      ],
    },
    5: {
      rivalId: "rion",
      lines: [
        { speakerId: "rion", line: "ロマ子さん、次の挑戦者は僕です。作った側の意地、見せますよ。" },
        { speakerId: "romako", line: "作った側だろうが何だろうが、玉座の前では皆マゾ豚なのらわ！へーんだ！" },
        { speakerId: "rion", line: "……その台詞、実装した僕が言われると複雑だなあ。" },
      ],
    },
  },

  bg: {
    1: {
      rivalId: "baku",
      lines: [
        { speakerId: "baku", line: "BG、今日は何して過ごすの……？" },
        { speakerId: "bg", line: "何も決めてないぶひ。気づいたら夜になってるぶひ。" },
        { speakerId: "baku", line: "僕たち、気が合うね……たぶん……。" },
      ],
    },
    2: {
      rivalId: "shingo",
      lines: [
        { speakerId: "shingo", line: "BGトン、大会エントリーしといたぶひ！感謝するぶひ！" },
        { speakerId: "bg", line: "ブヒー！ありがとうございます〜❤️ ……で、何の大会ぶひ？" },
        { speakerId: "shingo", line: "聞いてなかったのかよ！罵倒デッキ構築大会だぶひ！" },
      ],
    },
    3: {
      rivalId: "teruzo",
      lines: [
        { speakerId: "teruzo", line: "BGって、何を言われても効かないよね。俺なんてさ全部刺さっちゃうのに。" },
        { speakerId: "bg", line: "ん？なんか言ったぶひ？" },
        { speakerId: "teruzo", line: "……ほら、その鈍感さだよ。でもね、追い込まれてからの僕はだいぶしぶといよ。" },
        { speakerId: "bg", line: "じゃあ追い込んでみるぶひ。" },
      ],
    },
    4: {
      rivalId: "uemu",
      lines: [
        { speakerId: "uemu", line: "BGさんの主張は論理が飛躍しています。前提から説明してください。" },
        { speakerId: "bg", line: "課金は正義ぶひ。以上ぶひ。" },
        { speakerId: "uemu", line: "結論しかない……だが、なぜか反論できない……！" },
      ],
    },
    5: {
      rivalId: "romako",
      lines: [
        { speakerId: "romako", line: "アンタ、最近調子に乗ってるらしいわね。女王自ら試してあげるのらわ。" },
        { speakerId: "bg", line: "ロマ子様に罵倒してもらえるなんてご褒美ぶひ〜❤️" },
        { speakerId: "romako", line: "マゾ豚に罵倒は効かないのかしら……厄介なのらわ。" },
      ],
    },
  },

  shingo: {
    1: {
      rivalId: "take",
      lines: [
        { speakerId: "take", line: "しんごトン、また赤信号にキレてたでしょ。顔に出てたよ。" },
        { speakerId: "shingo", line: "うるさいぶひ！たけちゃんこそ考える前に喋りすぎだぶひ！" },
        { speakerId: "take", line: "お互い様ってことで、今日も仲良く言い合いしよ！" },
      ],
    },
    2: {
      rivalId: "uemu",
      lines: [
        { speakerId: "uemu", line: "しんごさん、例の大会のルールブック、要点をまとめておきました。" },
        { speakerId: "shingo", line: "うえむトン、ありがとうぶひ！でも読む前に体が動いちまうぶひ！" },
        { speakerId: "uemu", line: "……せめて勝利条件だけでも読んでください。" },
      ],
    },
    3: {
      rivalId: "picco",
      lines: [
        { speakerId: "picco", line: "しんごトンって沸点低すぎぶひ！ほら、もう眉がピクピクしてるぶひ！はっはっは^_^" },
        { speakerId: "shingo", line: "うるさいぶひ！……いや、落ち着け。言いたいことを言えばスッキリするぶひーーーーー！" },
        { speakerId: "picco", line: "言う前に手が出ないようにしてくれぶひ。ププッ、しんごトン面白いぶひ" },
        { speakerId: "shingo", line: "うぉおお!ピッコートン！僕と勝負ぶひ！！" },
      ],
    },
    4: {
      rivalId: "romako",
      lines: [
        { speakerId: "romako", line: "アンタ、ロマ子様を想像してスッキリしてるってどういうことなのらわ！？" },
        { speakerId: "shingo", line: "ほ、本人登場ぶひ！？でも事実だからしょうがないぶひ！" },
        { speakerId: "romako", line: "たっく、気色悪りぃ！！ぶちのめしてやんわ！！" },
      ],
    },
    5: {
      rivalId: "bg",
      lines: [
        { speakerId: "shingo", line: "BGトン、今度は僕が誘う番だぶひ。一緒に大会出るぶひ！" },
        { speakerId: "bg", line: "めんどくさいぶひ……でもしんごトンが言うなら出るぶひ。" },
        { speakerId: "shingo", line: "その意気だぶひ！まずは僕と練習試合だぶひ！" },
      ],
    },
  },

  hisa: {
    1: {
      rivalId: "baku",
      lines: [
        { speakerId: "baku", line: "Hisaといると、しゃべらなくていいから楽だなあ……。" },
        { speakerId: "hisa", line: "……（頷く）" },
        { speakerId: "baku", line: "……この沈黙、心地いいね。じゃ、対戦しよっか。" },
      ],
    },
    2: {
      rivalId: "sachiyo",
      lines: [
        { speakerId: "sachiyo", line: "あら、Hisaちゃんもエントリー？書き方がわからなかったら言ってね。" },
        { speakerId: "hisa", line: "……（記入済みのエントリーシートを差し出す）" },
        { speakerId: "sachiyo", line: "もう書けてるのね。手際が良くてえらいえらい。" },
      ],
    },
    3: {
      rivalId: "mito",
      lines: [
        { speakerId: "mito", line: "Hisaの沈黙、点数で言うと8点。怖さはあるけど、言葉が足りない。" },
        { speakerId: "hisa", line: "……。" },
        { speakerId: "mito", line: "ほら、その沈黙。減点しづらいんだよね、実際。" },
        { speakerId: "hisa", line: "（じっと見つめている）" },
      ],
    },
    4: {
      rivalId: "garyu",
      lines: [
        { speakerId: "garyu", line: "……。" },
        { speakerId: "hisa", line: "……。" },
        { speakerId: "garyu", line: "（今のは効いたな）……語らずして語るか。良い眼だ。" },
      ],
    },
    5: {
      rivalId: "picco",
      lines: [
        { speakerId: "picco", line: "Hisaさん、無言はずるいって！こっちのペースが乱れる〜！" },
        { speakerId: "hisa", line: "……（少し口角が上がる）" },
        { speakerId: "picco", line: "あっ、今笑った！絶対わざとだ！勝負！" },
      ],
    },
  },

  take: {
    1: {
      rivalId: "picco",
      lines: [
        { speakerId: "picco", line: "たけちゃん、今日も口が早いね！でも足はボクのが早いよ！" },
        { speakerId: "take", line: "口の早さで勝負しろって！よーいドン！" },
        { speakerId: "picco", line: "もう始まってる！？" },
      ],
    },
    2: {
      rivalId: "teruzo",
      lines: [
        { speakerId: "take", line: "てるぞーさん、一緒に大会出よう！絶対楽しいって！" },
        { speakerId: "teruzo", line: "べ、別に興味ないけど……暇だから付き合ってやるよ。" },
        { speakerId: "take", line: "その照れ方、興味あるやつだ！" },
      ],
    },
    3: {
      rivalId: "teruzo",
      lines: [
        { speakerId: "teruzo", line: "あれ？たけちゃんじゃん！こんなところで何にしてるの？" },
        { speakerId: "take", line: "てるぞーさんじゃないですか。ロマ子様とデートのために大会に出てるんですよ" },
        { speakerId: "teruzo", line: "いやぁ、たけちゃんじゃ無理だよ。多分俺にも勝てないよ" },
        { speakerId: "take", line: "プキーン！てるぞーさん！たけさんと勝負ブヒ！" },
      ],
    },
    4: {
      rivalId: "shingo",
      lines: [
        { speakerId: "shingo", line: "たけちゃん、この前のリベンジに来たぶひ！" },
        { speakerId: "take", line: "何回来ても同じだよ！俺の瞬発力は今日も絶好調！" },
        { speakerId: "shingo", line: "その自信ごと叩き折ってスッキリするぶひ！" },
      ],
    },
    5: {
      rivalId: "romako",
      lines: [
        { speakerId: "take", line: "ロマ子様！優勝したらデートの約束、覚えてるよね！" },
        { speakerId: "romako", line: "約束した覚えは一切ないのらわ！！寝言は寝て言いなさい！" },
        { speakerId: "take", line: "じゃあ勝って現実にするだけだね！" },
      ],
    },
  },

  teruzo: {
    1: {
      rivalId: "sachiyo",
      lines: [
        { speakerId: "sachiyo", line: "てるぞーちゃん、今日の服も似合ってるわねえ。えらいえらい。" },
        { speakerId: "teruzo", line: "べ、別に普通だし……褒めても何も出ないし……。" },
        { speakerId: "sachiyo", line: "照れてるのもかわいいわねえ。" },
      ],
    },
    2: {
      rivalId: "take",
      lines: [
        { speakerId: "take", line: "てるぞーさん、エントリー用紙持ってきたよ！はいペン！" },
        { speakerId: "teruzo", line: "押し付けるなって……まあ、書くけどさ。" },
        { speakerId: "take", line: "書くんだ！" },
      ],
    },
    3: {
      rivalId: "mito",
      lines: [
        { speakerId: "mito", line: "てるぞーの照れ隠し、演技力は2点。バレバレだよ。" },
        { speakerId: "teruzo", line: "べ、別に隠してないし。照れてもないし。" },
        { speakerId: "mito", line: "その反応込みで7点に修正。おもしろいから。" },
        { speakerId: "teruzo", line: "採点やめろ！　……対戦で黙らせてやる。" },
      ],
    },
    4: {
      rivalId: "mito",
      lines: [
        { speakerId: "mito", line: "照れ隠しが必殺技になるとはね。発想は9点。" },
        { speakerId: "teruzo", line: "て、point稼ぎに来たわけじゃないし……でも9点は悪くないな。" },
        { speakerId: "mito", line: "素直になったら10点あげる。" },
      ],
    },
    5: {
      rivalId: "hisa",
      lines: [
        { speakerId: "teruzo", line: "Hisaさんは静かでいいよな。俺みたいに口で損しないし。" },
        { speakerId: "hisa", line: "……（首を横に振る）" },
        { speakerId: "teruzo", line: "『そのままでいい』って？……べ、別に嬉しくないし！" },
      ],
    },
  },

  rion: {
    1: {
      rivalId: "mito",
      lines: [
        { speakerId: "mito", line: "りおんの観察眼、85点。ただし自分のことは見えてない。" },
        { speakerId: "rion", line: "うっ、それ一番言われたくないやつ……。" },
        { speakerId: "mito", line: "自覚があるなら90点に上げよう。対戦で確かめる？" },
      ],
    },
    2: {
      rivalId: "bg",
      lines: [
        { speakerId: "rion", line: "BG、テストプレイ付き合ってくれてありがとう。バグあった？" },
        { speakerId: "bg", line: "気づいたら全カードを課金で揃えたくなったぶひ。良いゲームぶひ。" },
        { speakerId: "rion", line: "課金要素ないんだけど！？" },
      ],
    },
    3: {
      rivalId: "garyu",
      lines: [
        { speakerId: "garyu", line: "（じっとりおんを見ている）" },
        { speakerId: "rion", line: "うっ……見透かされてる気がする……。" },
        { speakerId: "garyu", line: "目は口ほどに物を言う。お前の迷いも、な。" },
        { speakerId: "rion", line: "でも、追い込まれてからが僕の本番ですから。" },
      ],
    },
    4: {
      rivalId: "uemu",
      lines: [
        { speakerId: "uemu", line: "『追い込まれてからが本番』——非合理的ですが、データ上、実際に強い。" },
        { speakerId: "rion", line: "でしょ？理屈じゃないんだよね、これ。" },
        { speakerId: "uemu", line: "では、その再現性を理屈で検証させてください。対戦で。" },
      ],
    },
    5: {
      rivalId: "romako",
      lines: [
        { speakerId: "romako", line: "このゲーム、ロマ子様の魅力が3割も出せてないのらわ。作り直しなさい！" },
        { speakerId: "rion", line: "手厳しいなあ……じゃあ、勝ったら要望を聞きますよ。" },
        { speakerId: "romako", line: "言ったわね？決闘なのらわ！！" },
      ],
    },
  },

  baku: {
    1: {
      rivalId: "hisa",
      lines: [
        { speakerId: "hisa", line: "……。" },
        { speakerId: "baku", line: "……うん、いい天気だね……。" },
        { speakerId: "hisa", line: "……（頷いて、カードを取り出す）" },
      ],
    },
    2: {
      rivalId: "picco",
      lines: [
        { speakerId: "picco", line: "バク！エントリー締切、今日までだよ！急いで急いで！" },
        { speakerId: "baku", line: "え……今日……？　まあ、間に合えばいいか……。" },
        { speakerId: "picco", line: "その速度で間に合うわけないでしょ！ボクが引っ張ってく！" },
      ],
    },
    3: {
      rivalId: "rion",
      lines: [
        { speakerId: "rion", line: "バクって、ぼんやりしてるようで実は全部見えてるでしょ。" },
        { speakerId: "baku", line: "ん……今、何か言った？" },
        { speakerId: "rion", line: "ほらそれ！その一拍が読めないんだよなあ。" },
        { speakerId: "baku", line: "君の次の一手なら、もう食べちゃったけど。" },
      ],
    },
    4: {
      rivalId: "garyu",
      lines: [
        { speakerId: "garyu", line: "先を読む眼か。若いのに、良い眼をしている。" },
        { speakerId: "baku", line: "臥龍さんの次の一手も……もう食べちゃいました。" },
        { speakerId: "garyu", line: "ほう。ならば読み合いといこう。" },
      ],
    },
    5: {
      rivalId: "mito",
      lines: [
        { speakerId: "mito", line: "バクの対戦、採点しようとすると毎回基準が壊れる。何なの。" },
        { speakerId: "baku", line: "ん……今、何か言った……？" },
        { speakerId: "mito", line: "その反応も込みで採点不能。もう一回見せて。" },
      ],
    },
  },

  sachiyo: {
    1: {
      rivalId: "shingo",
      lines: [
        { speakerId: "shingo", line: "さちよさん、聞いてくれぶひ！また赤信号に負けたぶひ！" },
        { speakerId: "sachiyo", line: "あらあら。ちゃんと信号を待てたのねえ、えらいえらい。" },
        { speakerId: "shingo", line: "待っただけで褒められたぶひ！？" },
      ],
    },
    2: {
      rivalId: "hisa",
      lines: [
        { speakerId: "sachiyo", line: "Hisaちゃんも出るなら、私も出ようかしらねえ。" },
        { speakerId: "hisa", line: "……（こくり）" },
        { speakerId: "sachiyo", line: "決まりね。お互い頑張りましょうねえ。" },
      ],
    },
    3: {
      rivalId: "romako",
      lines: [
        { speakerId: "romako", line: "甘いのよ、さちよ。優しさじゃ誇りは守れないわ。" },
        { speakerId: "sachiyo", line: "あらあら。でもね、ロマ子ちゃんも毎日頑張っててえらいえらい。" },
        { speakerId: "romako", line: "なっ……女王を子ども扱いしないでちょうだい！" },
        { speakerId: "sachiyo", line: "はいはい、ちゃんと怒れるのもえらいえらい。" },
      ],
    },
    4: {
      rivalId: "take",
      lines: [
        { speakerId: "take", line: "さちよさんの包容力、逆に怖いんだけど！罵倒が全部吸われる！" },
        { speakerId: "sachiyo", line: "たけちゃんの元気な罵倒、今日もえらいえらい。" },
        { speakerId: "take", line: "くっ……勝てる気がしない……でもやるしかない！" },
      ],
    },
    5: {
      rivalId: "uemu",
      lines: [
        { speakerId: "uemu", line: "さちよさんの『えらいえらい』には、論理的な反論が不可能です。" },
        { speakerId: "sachiyo", line: "うえむちゃんは難しく考えられてえらいえらい。" },
        { speakerId: "uemu", line: "……ほら。こうなる。せめて対戦では全力でお願いします。" },
      ],
    },
  },

  uemu: {
    1: {
      rivalId: "mito",
      lines: [
        { speakerId: "uemu", line: "みとさん、その採点の評価基準を文書化しませんか。" },
        { speakerId: "mito", line: "基準は気分。以上。" },
        { speakerId: "uemu", line: "最悪だ……しかし興味深い。検証させてください。" },
      ],
    },
    2: {
      rivalId: "garyu",
      lines: [
        { speakerId: "uemu", line: "臥龍さん、大会に出るなら過去の対戦データを共有します。" },
        { speakerId: "garyu", line: "データか。……儂の眼は、データより早い。" },
        { speakerId: "uemu", line: "では、どちらが正しいか実戦で。" },
      ],
    },
    3: {
      rivalId: "bg",
      lines: [
        { speakerId: "uemu", line: "BGさん、あなたの主張には前提が3つ抜けています。" },
        { speakerId: "bg", line: "そんなの関係ないぶひ。事実はひとつだけぶひ。" },
        { speakerId: "uemu", line: "……シンプルすぎて逆に反論しづらい。" },
        { speakerId: "bg", line: "無駄な理屈は、防御ごと吹き飛ばすぶひ！" },
      ],
    },
    4: {
      rivalId: "rion",
      lines: [
        { speakerId: "rion", line: "うえむの理詰め、完成度上がったね。設計者としても感心するよ。" },
        { speakerId: "uemu", line: "恐縮です。ですが、まだ検証項目が残っています——あなたです。" },
        { speakerId: "rion", line: "僕はデータにないよ？" },
      ],
    },
    5: {
      rivalId: "shingo",
      lines: [
        { speakerId: "shingo", line: "うえむトン、あの時ルールを教えてくれてありがとうぶひ！" },
        { speakerId: "uemu", line: "読まずに勝ち続けるのは、正直、理屈に合わないのですが。" },
        { speakerId: "shingo", line: "理屈よりスッキリだぶひ！" },
      ],
    },
  },

  mito: {
    1: {
      rivalId: "teruzo",
      lines: [
        { speakerId: "mito", line: "てるぞーの今日のコーデ、82点。惜しい。" },
        { speakerId: "teruzo", line: "べ、別に点数なんて気にしてないし。……何が減点？" },
        { speakerId: "mito", line: "気にしてるじゃん。減点理由は対戦で教える。" },
      ],
    },
    2: {
      rivalId: "rion",
      lines: [
        { speakerId: "rion", line: "みとには審査員をお願いしようと思ってたんだけど……。" },
        { speakerId: "mito", line: "審査より出場。自分の点数は自分でつける。" },
        { speakerId: "rion", line: "かっこいいこと言うなあ。じゃあ登録しとくね。" },
      ],
    },
    3: {
      rivalId: "sachiyo",
      lines: [
        { speakerId: "mito", line: "さちよの包容力、100点満点中120点。採点基準が壊れる。" },
        { speakerId: "sachiyo", line: "みとちゃんは点数をつけるのが上手ねえ。えらいえらい。" },
        { speakerId: "mito", line: "……褒められると調子が狂うな。対戦ではちゃんと辛口でいくから。" },
        { speakerId: "sachiyo", line: "はいはい、手加減しないのもえらいえらい。" },
      ],
    },
    4: {
      rivalId: "baku",
      lines: [
        { speakerId: "mito", line: "バク、あなたの夢喰いは採点不能って言ったけど——今日こそ点数をつける。" },
        { speakerId: "baku", line: "ん……何点でも、いいよ……？" },
        { speakerId: "mito", line: "その余裕が一番腹立つ。勝負。" },
      ],
    },
    5: {
      rivalId: "picco",
      lines: [
        { speakerId: "picco", line: "みとさん、ボクの早口罵倒、何点！？" },
        { speakerId: "mito", line: "速さ98点、中身32点。" },
        { speakerId: "picco", line: "中身ぃ！？対戦で採点し直してもらう！" },
      ],
    },
  },

  picco: {
    1: {
      rivalId: "take",
      lines: [
        { speakerId: "picco", line: "たけちゃん、あの雲まで競走ね！よーいドン！" },
        { speakerId: "take", line: "言うより先に走り出すの、俺の専売特許だろ！" },
        { speakerId: "picco", line: "先に言ったもん勝ち〜！" },
      ],
    },
    2: {
      rivalId: "baku",
      lines: [
        { speakerId: "picco", line: "バクも一緒にエントリーしよ！ほら、ペン持って！" },
        { speakerId: "baku", line: "うん……あとでね……。" },
        { speakerId: "picco", line: "あとでは今！締切は待ってくれないの！" },
      ],
    },
    3: {
      rivalId: "take",
      lines: [
        { speakerId: "picco", line: "たけちゃん、どっちが先に相手を言い負かせるか勝負しよ！" },
        { speakerId: "take", line: "乗った！先手は俺だ！" },
        { speakerId: "picco", line: "あ、ずるい！もう始めてる！" },
        { speakerId: "take", line: "早い者勝ちって言ったのはそっちだろ！" },
      ],
    },
    4: {
      rivalId: "hisa",
      lines: [
        { speakerId: "picco", line: "Hisaさんの静けさ、ボクの速さでかき乱してみせる！" },
        { speakerId: "hisa", line: "……（構える）" },
        { speakerId: "picco", line: "その落ち着き、崩しがいがある〜！" },
      ],
    },
    5: {
      rivalId: "shingo",
      lines: [
        { speakerId: "picco", line: "しんごトン、新しい煽り考えたんだ！聞いて聞いて！" },
        { speakerId: "shingo", line: "聞く前から腹立つぶひ！言ってみろぶひ！" },
        { speakerId: "picco", line: "それは対戦で言う！" },
      ],
    },
  },

  garyu: {
    1: {
      rivalId: "hisa",
      lines: [
        { speakerId: "garyu", line: "……茶でも飲むか。" },
        { speakerId: "hisa", line: "……（頷く）" },
        { speakerId: "garyu", line: "（この静けさ、心地よい）……時に、一局どうだ。" },
      ],
    },
    2: {
      rivalId: "uemu",
      lines: [
        { speakerId: "uemu", line: "臥龍さんがエントリー……大会の平均レベルが跳ね上がりますね。" },
        { speakerId: "garyu", line: "買い被るな。儂はただ、機が熟すのを待っていただけだ。" },
        { speakerId: "uemu", line: "その『機』の定義、あとで聞かせてください。" },
      ],
    },
    3: {
      rivalId: "uemu",
      lines: [
        { speakerId: "uemu", line: "臥龍さん、沈黙は論証になりませんよ。反論をどうぞ。" },
        { speakerId: "garyu", line: "……若いな。" },
        { speakerId: "uemu", line: "年齢は論点ではありません。論理の話をしています。" },
        { speakerId: "garyu", line: "ならば対戦で語ろう。目と目でな。" },
      ],
    },
    4: {
      rivalId: "romako",
      lines: [
        { speakerId: "romako", line: "古参の眼力とやら、女王の前でも通用するのかしら？" },
        { speakerId: "garyu", line: "試してみるがいい。……その減らず口ごと、見切ってやろう。" },
        { speakerId: "romako", line: "上等なのらわ！！" },
      ],
    },
    5: {
      rivalId: "baku",
      lines: [
        { speakerId: "baku", line: "臥龍さんの眼、僕の夢喰いと似てる気がする……。" },
        { speakerId: "garyu", line: "読みの本質は同じ、か。若いの、続きは盤上で語れ。" },
        { speakerId: "baku", line: "はい……もう読み始めてます。" },
      ],
    },
  },
};

export function getChapterEncounter(characterId: string, chapter: number): ChapterEncounter | null {
  return CHAPTER_ENCOUNTERS[characterId]?.[chapter] ?? null;
}
