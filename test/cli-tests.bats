#!/usr/bin/env bats
# Testing command line tools
# https://blog.engineyard.com/2014/bats-test-command-line-tools
# https://github.com/sstephenson/bats

DIR=$BATS_TEST_DIRNAME
CMD="node $DIR/../pick_json.js"

@test "Reading from stdin works" {
    run $CMD redis.connected < $DIR/example.json
    [ ${output} = "true" ]
}

@test "Reading from a file works" {
    run $CMD redis.connected $DIR/example.json
    [ ${output} = "true" ]
}

@test "Working with arrays of objects works" {
    run bash -c "echo '[ { \"bar\" : 42 } ]' | $CMD -a [0].bar"
    [ ${output} = "42" ]
}

@test "Can evaluate a random expression" {
    run bash -c "echo '[ { \"bar\" : 42 } ]' |  $CMD -a \"[0].bar > 40\""
    [ ${output} = true ]
}
