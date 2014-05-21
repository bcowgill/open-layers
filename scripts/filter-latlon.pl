#!/usr/bin/env perl

use strict;
use warnings;
use English -no_match_vars;

my $raZones = [
	# UK
	[[-10.85272, 49.01426], # lon,lat min
	[2.63250, 61.58262]],   # lon,lat max

	# Islands near Africa to calibrate heatmap delta
	[[8.14239, 3.43956], # lon,lat min
	[9.97436, 4.43657]], # lon,lat max

];
my $LON = 0;
my $LAT = 1;
my $MIN = 0;
my $MAX = 1;
my $counter =  2000;
my $LIMIT = 0;


sub in_the_zone
{
	my ($lat, $lon, $raZone) = @ARG;
	if ($raZone->[$MIN][$LON] <= $lon
		&& $lon <= $raZone->[$MAX][$LON]
		&& $raZone->[$MIN][$LAT] <= $lat
		&& $lat <= $raZone->[$MAX][$LAT])
	{
		return 1;
	}
	return 0;
}

sub in_the_zones
{
	my ($lat, $lon, $raZones) = @ARG;
	foreach my $raZone (@$raZones)
	{
		my $in = in_the_zone($lat, $lon, $raZone);
		return 1 if $in;
	}
	return 0;
}

sub r
{
	return int(rand(256));
}

sub some_ip
{
	return join('.', r(), r(), r(), r());
}

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
		if (!$LIMIT || $counter)
		{
			if (in_the_zones($lat, $lon, $raZones))
			{
				--$counter;

				# protect privacy by randomizing the IP address
				$line =~ s{"(\d+\.\d+\.\d+\.\d+)"}{some_ip()}xmse;
				print $line;
			}
		}
	}
	else
	{
		print $line;
	}
}
