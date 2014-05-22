#!/usr/bin/env perl

use strict;
use warnings;
use English -no_match_vars;
use Data::Dumper;

my $description = "UK, Hawaii, plus Islands near Africa for calibration";
my $USE_ZONES = 1;
my $CHOOSE = 0.8;

my $raZones = [
	# UK
	[[-10.85272, 49.01426], # lon,lat min
	[2.63250, 61.58262]],   # lon,lat max

	# Islands near Africa to calibrate heatmap delta
	[[1.57531, -1.77620], # lon,lat min
	[11.28722, 6.96892]], # lon,lat max

	# Hawaiian Islands to calibrate static ip delta
	[[-162.03356, 17.30585], # lon,lat min
	[-152.56335, 23.74240]], # lon,lat max

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

my $filter = "randomly chosen  > $CHOOSE";
if ($USE_ZONES)
{
	$filter = "$description\n   @{[Dumper($raZones)]}";
}
print "/* data generated by filter-latlon.pl\n   $filter\n*/\n";
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
			if (pick_this($lat, $lon))
			{
				--$counter;

				# protect privacy by randomizing the IP address
				$line =~ s{"(\d+\.\d+\.\d+\.\d+)"}{'"' . some_ip() . '"'}xmse;
				print $line;
			}
		}
	}
	else
	{
		print $line;
	}
}

sub pick_this
{
	my ($lat, $lon) = @ARG;

	if ($USE_ZONES)
	{
		return in_the_zones($lat, $lon, $raZones);
	}
	else
	{
		return rand() > $CHOOSE ? 1 : 0;
	}
}
