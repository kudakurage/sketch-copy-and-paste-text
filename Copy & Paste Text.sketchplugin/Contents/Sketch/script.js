var doc = undefined;
var selection = undefined;
var selectedCount = undefined;
var artboards = undefined;
var pasteBoard = undefined;

function initDoc (context) {
  doc = context.document;
  selection = context.selection;
  selectedCount = selection.count();
  pasteBoard = NSPasteboard.generalPasteboard();
}

function getLayerType (selectedLayer) {
  return selectedLayer.class();
}

function truncate (text, length) {
  length = length ? parseInt(length, 10) : 20;
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '…';
};

function copyText (context) {
  initDoc(context);

  var arr = [];
  if ( selectedCount == 0 ) {
    doc.showMessage("No layers are selected.");
  } else {
    pasteBoard.clearContents();
    for ( var i = 0; i < selectedCount; i++ ) {
      var layer = selection[i];
      varX = [[layer absoluteRect] rulerX];
      varY = [[layer absoluteRect] rulerY];
      var layerType = getLayerType(layer);

      if ( layerType == 'MSTextLayer' ) {
        var copiedText = layer.stringValue();
        arr.push({'x': varX, 'y': varY, 'text': copiedText});
      } else {
        var children = layer.children();

        for ( var z = 0; z < children.length; z++ ){
          if ( getLayerType(children[z] ) == 'MSTextLayer' ){

            child = children[z];
            childVarX = [[child absoluteRect] rulerX]
            childVarY = [[child absoluteRect] rulerY]
            var copiedTextChild = child.stringValue();
            arr.push({'x': childVarX, 'y': childVarY, 'text': copiedTextChild});
          }
        }
      }
    }
  }

  arr.sort(function(a, b) {
    return a.y == b.y ? a.x - b.x : a.y - b.y;
  });

  arranged = [];

  for ( var i = 0; i < arr.length; i++ ) {
    if ( typeof( arr[i].wasAdded ) == "undefined") {
      arranged.push(arr[i]);
      arr[i].wasAdded = "true";

      for ( j = i + 1; j < arr.length; j++ ) {
        if ( arr[i].y > arr[j].y && typeof( arr[j].wasAdded ) == "undefined" ) {
          arranged.push(arr[j]);
          arr[j].wasAdded = "true";
        }
      }
    }
  }

  var finalTexts = "";
  for ( var i = 0; i < arranged.length; i++ ) {
    var finalText = arranged[i].text;
    finalTexts = finalTexts + finalText;
    pasteBoard.writeObjects([finalText]);
  }

  finalTexts = finalTexts.replace(/\n/g, ' ');
  if (typeof finalTexts == "string" && finalTexts != "") {
    doc.showMessage("Copied texts. '" + truncate(finalTexts, 40) + "'");
  } else {
    doc.showMessage("No texts to be copied.");
  }
}


function pasteText(context) {
  initDoc(context);

  var stringFromPasteBoard = [pasteBoard stringForType:NSPasteboardTypeString];
  var arr = [];

  if ( selectedCount == 0 ) {
    doc.showMessage("No layers are selected.");
  } else {
    for ( var i = 0; i < selectedCount; i++ ) {
      var layer = selection[i];
      var layerType = getLayerType(layer);

      if ( layerType == 'MSTextLayer' ) {
        arr.push(layer);
      } else {
        var children = layer.children();

        for ( var z = 0; z < children.length; z++ ){
          if ( getLayerType(children[z] ) == 'MSTextLayer' ){
            childLayer = children[z];
            arr.push(childLayer);
          }
        }
      }
    }
  }

  var finalTexts = String(stringFromPasteBoard);
  if (finalTexts != null && finalTexts != "") {
    for ( var i = 0; i < arr.length; i++ ) {
      arr[i].stringValue = finalTexts;
    }
    finalTexts = finalTexts.replace(/\n/g, ' ');
    doc.showMessage("Pasted texts. '" + truncate(finalTexts, 40) + "'");
  } else {
    doc.showMessage("No texts to be pasted.");
  }
}
