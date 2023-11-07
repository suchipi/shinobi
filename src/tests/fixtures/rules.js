rule("cc", {
  command: "$cc $cflags $in -o $out",
  description: "CC $out",
});

rule("ar", {
  command: "rm -f $out && $ar crs $out $in",
  description: "AR $out",
});

rule("link", {
  command: "$cc $ldflags -o $out $in $libs",
  description: "CC $out",
});

rule("something_with_args", {
  command: "cat $in > $out && echo $message >> $out",
  description: "SOMETHING_WITH_ARGS $out",
});
