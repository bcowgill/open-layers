#!/usr/bin/env perl

use strict;
use warnings;

my $raScan = [
	[-10.85272, 49.01426], # lon,lat min
	[2.63250, 61.58262]    # lon,lat max
];
my $counter =  2000;


while (my $line = <>)
{

#   var StaticIPLatLonRadiusMeters = [
#   ["1.0.130.142",14.522523,100.936730,0.00],
#   []
#   ];

	if ($line =~ m{" , ([0-9\-\.]+) , ([0-9\-\.]+) ,}xms)
	{
		my $lat = $1;
		my $lon = $2;
		if ($counter)
		{
			--$counter;
			print $line;
		}
	}
	else
	{
		print $line;
	}
}
