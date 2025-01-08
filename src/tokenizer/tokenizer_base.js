class BaseTokenizer {
    constructor(_Charset, _SpecialsFirst = [], _SpecialsLast = []) {
        this.Tokens = [..._SpecialsFirst, ...[..._Charset, '[UNK]'], ..._SpecialsLast];
        this.TokenMap = new Map(this.Tokens.map((Token, Index) => [Token, Index]));
    }

    TokensToIds(Tokens) {
        return Array.from(Tokens, Token => this.TokenMap.get(Token));
    }

    IdsToTokens(TokenIds, Join = true) {
        const Result = TokenIds.map(Id => this.Tokens[Id]);
        return Join ? Result.join('') : Result;
    }

    decode(TokenDists, Raw = false) {
        return TokenDists.reduce((Batch, Dist) => {
            const [MaxProbs, Ids] = this.GetMaxDistribution(Dist);
            const [FilteredProbs, FilteredIds] = Raw ? [MaxProbs, Ids] : this.FilterTokens(MaxProbs, Ids);
            Batch[0].push(this.IdsToTokens(FilteredIds, !Raw));
            Batch[1].push(FilteredProbs);
            return Batch;
        }, [[], []]);
    }

    GetMaxDistribution(Tensor) {
        return Tensor.reduce(([Probs, Ids], Row) => {
            const MaxIndex = Row.reduce((MaxIdx, Val, Idx) => 
                Val > Row[MaxIdx] ? Idx : MaxIdx, 0);
            return [
                [...Probs, Row[MaxIndex]],
                [...Ids, MaxIndex]
            ];
        }, [[], []]);
    }
}

class Tokenizer extends BaseTokenizer {
    constructor(_Charset) {
        const _EOS = '[E]', _BOS = '[B]', _PAD = '[P]';
        super(_Charset, [_EOS], [_BOS, _PAD]);
        this.EosId = this.TokenMap.get(_EOS);
        this.BosId = this.TokenMap.get(_BOS);
        this.PadId = this.TokenMap.get(_PAD);
    }

    FilterTokens(Probs, Ids) {
        const EosIndex = Ids.indexOf(this.EosId);
        const SliceIndex = EosIndex < 0 ? Ids.length : EosIndex;
        return [
            Probs.slice(0, SliceIndex + 1),
            Ids.slice(0, SliceIndex)
        ];
    }
}

module.exports = {
    Tokenizer
};