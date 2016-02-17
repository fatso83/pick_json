#!/usr/bin/env bats
# Testing command line tools
# https://blog.engineyard.com/2014/bats-test-command-line-tools
# https://github.com/sstephenson/bats

DIR=$BATS_TEST_DIRNAME
CMD="node $DIR/../pick_json.js"

@test "Reading from stdin works" {
    run $CMD --exp redis.connected < $DIR/example.json
    [ ${output} = "true" ]
}

@test "Reading from a file works" {
    run $CMD --exp redis.connected -f $DIR/example.json
    [ ${output} = "true" ]
}

@test "Outputting keys from a sub element works" {
    run $CMD --keys --exp redis -f $DIR/example.json
    [[ ${lines[0]} =~ "connected" ]]
    [[ ${lines[1]} =~ "ready" ]]
    [[ ${lines[2]} =~ "connections" ]]
    [[ ${lines[3]} =~ "commandsSent" ]]
    [[ ${lines[4]} =~ "commandQueue" ]]
}

@test "Outputting keys from the root works" {
    run $CMD --keys  -f $DIR/example.json
    [[ ${lines[0]} =~ "redis" ]]
    [[ ${lines[1]} =~ "error_codes" ]]
}

@test "Working with arrays of objects works" {
    run bash -c "echo '[ { \"bar\" : 42 } ]' | $CMD -e [0].bar"
    [ ${output} = "42" ]
}

@test "Can evaluate an expression on an property" {
    run bash -c "echo '[ { \"bar\" : 42 } ]' |  $CMD -e \"[0].bar > 40\""
    [ ${output} = true ]
}


@test "Can transform an array property" {
    run pick_json -e "error_codes.filter(err => err > 3000)" -f $DIR/example.json
    [[ ${lines[0]} = "[" ]]
    [[ ${lines[1]} =~ "4004" ]]
    [[ ${lines[2]} = "]" ]]
}

# More of a documentation test than anything else
@test "Can do direct transforms on arrays" {
    run bash -c "echo '[1,2,3,4,5]' | pick_json -e '.filter( val => val > 3 )'"
    [[ ${lines[0]} = "[" ]]
    [[ ${lines[1]} =~ "4" ]]
    [[ ${lines[2]} =~ "5" ]]
    [[ ${lines[3]} = "]" ]]
}

@test "Can handle operations on arrays without a preceding dot" {
    run bash -c "echo '[1,2,3,4,5]' | pick_json -e 'filter( val => val > 3 )'"
    [[ ${lines[0]} = "[" ]]
    [[ ${lines[1]} =~ "4" ]]
    [[ ${lines[2]} =~ "5" ]]
    [[ ${lines[3]} = "]" ]]
}
