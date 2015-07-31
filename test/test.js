var duid = require( '../index' );
var test = require( "unit.js" );
var async = require( "async" );
var bignum = require( "bn.js" );
var _ = require('lodash');

var check_duplicates = function ( arr ) {
  arr.sort();
  for ( var i = 1; i < arr.length; i++ ) {
    if ( arr[ i - 1 ] === arr[ i ] )
      return false;
  }
  return true;
};

describe( 'Short DUID', function () {

  var init = duid.init;
  var epoch_start = 1433116800 * 1000; //Mon, 01 Jun 2015 00:00:00 GMT
  var salt = '39622feb2b3e7aa7208f50f45ec36fd513baadad6977b53295a3b28aeaed4a54'; //dd if=/dev/random bs=1 count=102400 2>/dev/null| sha256sum

  var duid_instance1 = new init( 123, salt, epoch_start );
  var duid_instance2 = new init( 12, salt, epoch_start );

  describe( '#getEpochStart()', function () {

    it( 'should return set epoch start, for instance #1: ' + epoch_start, function () {
      test.value( duid_instance1.getEpochStart() )
          .isEqualTo( epoch_start );
    } );

    it( 'should return set epoch start, for instance #2: ' + epoch_start, function () {
      test.value( duid_instance2.getEpochStart() )
          .isEqualTo( epoch_start );
    } );

    it( 'instance #1 and instance #2 should return same epoch start: ' + epoch_start, function () {
      test.value( duid_instance1.getEpochStart() ).isIdenticalTo( duid_instance2.getEpochStart() );
    } );

    it( 'should reset custom epoch to zero if given one larger than real epoch', function () {
      var custom_epoch_overflow = (new Date()).getTime() + _.random(2000, 1000 * 1000);
      var duid_instance_overflow = new init( 0, salt, custom_epoch_overflow );
      test.value( duid_instance_overflow.getEpochStart() ).isEqualTo( 0 );
      test.value( duid_instance_overflow.getEpochStart() ).isNotEqualTo( custom_epoch_overflow );
    } );

    it( 'should accept custom epoch that is even 1 millisecond in the past', function () {
      var custom_epoch_near = (new Date()).getTime() - _.random(1, 2);
      var duid_instance_near = new init( 0, salt, custom_epoch_near );
      test.value( duid_instance_near.getEpochStart() ).isEqualTo( custom_epoch_near );
    } );

  } );

  describe( '#getSalt()', function () {

    it( 'should return set salt, for instance #1: ' + salt, function () {
      test.string( duid_instance1.getSalt() ).isIdenticalTo( salt );
    } );

    it( 'should return set salt, for instance #2: ' + salt, function () {
      test.string( duid_instance2.getSalt() ).isIdenticalTo( salt );
    } );

    it( 'instance #1 and instance #2 should return same salt: ' + salt, function () {
      test.string( duid_instance1.getSalt() ).isIdenticalTo( duid_instance2.getSalt() );
    } );

  } );

  describe( '#getShardID()', function () {

    var duid_instance_shardid_overflow = new init( 1024, salt, 0 );

    it( 'should overflow if shard_id is set to integer that does not fit in 10 bits: 1024 --> 0', function () {
      test.number( duid_instance_shardid_overflow.getShardID() ).is( 0 );
    } );

    it( 'should return set shard id for instance #1: 123', function () {
      test.number( duid_instance1.getShardID() ).is( 123 );
    } );

    it( 'should return set shard id for instance #2: 12', function () {
      test.number( duid_instance2.getShardID() ).is( 12 );
    } );

    it( 'should return different shard ids for instance #1 and instance #2', function () {
      test.number( duid_instance2.getShardID() ).isNot( duid_instance1.getShardID() );
    } );

  } );

  describe( '#getDUID()', function () {
    var tests = [ {
      args: 1,
      expected: 1
    }, {
      args: 0,
      expected: 0
    }, {
      args: 8192,
      expected: 8192
    }, {
      args: 8193,
      expected: 1
    } ];

    tests.forEach( function ( iter ) {
      it( 'Asked for ' + iter.args + ' DUIDs, correctly returns ' + iter.expected + ' DUIDs', function () {
        test.array( duid_instance1.getDUID( iter.args ) ).hasLength( iter.expected );
      } );
    } );

    it( 'should have no duplicates in the returned arrays, 8192 IDs each, and combined.', function () {
      var res1 = duid_instance1.getDUID( 8192 );
      var res2 = duid_instance2.getDUID( 8192 );
      var res3 = duid_instance1.getDUID( 8192 );
      test.array( _.uniq( res1 ) ).is( res1 );
      test.array( _.uniq( res2 ) ).is( res2 );
      test.array( _.uniq( res3 ) ).is( res3 );
      test.array( _.uniq( _.flattenDeep( [ res1, res2, res3 ] ) ) ).is( _.flattenDeep( [ res1, res2, res3 ] ) );
    } );

  } );

  describe( '#getDUIDInt()', function () {
    var tests = [ {
      args: 1,
      expected: 1
    }, {
      args: 0,
      expected: 0
    }, {
      args: 8192,
      expected: 8192
    }, {
      args: 8193,
      expected: 1
    } ];

    tests.forEach( function ( iter ) {
      it( 'Asked for ' + iter.args + ' Int DUIDs, correctly returns ' + iter.expected + ' Integer DUIDs', function () {
        test.array( duid_instance1.getDUID( iter.args ) ).hasLength( iter.expected );
      } );
    } );

    it( 'should have no duplicates in the returned arrays, 8192 IDs each, and combined.', function () {
      var res1 = duid_instance1.getDUIDInt( 8192 );
      var res2 = duid_instance2.getDUIDInt( 8192 );
      var res3 = duid_instance1.getDUIDInt( 8192 );
      test.array( _.uniq( res1 ) ).is( res1 );
      test.array( _.uniq( res2 ) ).is( res2 );
      test.array( _.uniq( res3 ) ).is( res3 );
      test.array( _.uniq( _.flattenDeep( [ res1, res2, res3 ] ) ) ).is( _.flattenDeep( [ res1, res2, res3 ] ) );
    } );

  } );

  describe( 'DUID with drifting time', function () {

    var duid_instance3 = new init( 123, salt, epoch_start );
    var id1 = bignum( duid_instance3.getDUIDInt( 1 )[ 0 ], 10 );
    var drift = duid_instance3.driftTime( Math.random() * 1000 * 10 * -1 | 0 );
    var id2 = bignum( duid_instance3.getDUIDInt( 4096 )[ 4095 ], 10 ); //Need to rollover sequence
    var curr_ms_time = bignum( duid_instance3.getCurrentTimeMs(), 10 );

    it( 'should generate ID with ' + drift + ' millisecond drift into the past from now( ' + curr_ms_time + ' ), ' + id1 + ' should be numerically smaller than ' + id2, function () {
      test.bool( id2.gt( id1 ) ).isTrue();
    } );

    it( 'should consistently generate unique IDs even when time is drifting backwards constantly', function () {
      drift = duid_instance3.driftTime( 0 ); //Reset drift back to 0
      var duids = [];
      for(var i = 0; i < 10; ++i) {
        duid_instance3.driftTime( drift );
        var start = (new Date()).getTime();
        duids[i] = duid_instance3.getDUIDInt( 8192 );
        drift = start - (new Date()).getTime();
        test.number( drift ).isLessThan( 0 );
        test.array( duids[i] ).hasLength( 8192 );
        test.array( _.uniq( duids[i] ) ).is( duids[i] );
      }
      var merged_uniq = _.uniq( _.flattenDeep( duids ) );
      test.array( merged_uniq ).is( _.flattenDeep( duids ) );
      test.array( merged_uniq ).hasLength( 8192 * 10 );
    } );

  } );

} );

// vim: syntax=cpp11:ts=2:sw=2
