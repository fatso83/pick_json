DIR=$(dirname "$0")
CMD="node $DIR/../pick_json.js"

TEST1=$($CMD redis.connected < $DIR/example.json)
TEST2=$(echo '[ { "bar" : 42 } ]' |  $CMD -a [0].bar)

[[ "$TEST1" == "true" ]] \
    && [[ "$TEST2" == "42" ]]
