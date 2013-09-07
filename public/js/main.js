$(function() {
	var clicked_opts = ["buy", "sell", "undef"];
	var clicked = clicked_opts[0];
	$('.btn').click(function(e){
		console.log(e.target.id);
		if(e.target.id === "insert"){
			$.get('/import', function(data){if(data === 'ok'){location.reload();}});
		} else if(e.target.id === "delete"){
			$.get('/drop', function(data){if(data === 'ok'){alert('deleted');});
		}else if(e.target.id !== clicked){
			$('#'+clicked).removeClass('active');
			$('#table_'+clicked).hide();
			clicked = e.target.id;
			$('#'+e.target.id).addClass('active');
			$('#table_'+e.target.id).fadeIn();
		}
	});
});